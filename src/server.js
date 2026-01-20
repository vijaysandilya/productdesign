require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Email Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper to save message
const saveMessage = (messageData) => {
    const filePath = path.join(__dirname, '../messages.json');
    let messages = [];

    try {
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, 'utf8');
            messages = JSON.parse(fileData);
        }
    } catch (err) {
        console.error('Error reading messages file:', err);
    }

    messages.push(messageData);

    try {
        fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
        return true;
    } catch (err) {
        console.error('Error writing messages file:', err);
        return false;
    }
};

// API Endpoint
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const newMessage = {
        id: Date.now(),
        name,
        email,
        message,
        timestamp: new Date().toISOString()
    };

    // 1. Save to JSON
    const saved = saveMessage(newMessage);
    if (!saved) {
        return res.status(500).json({ success: false, message: 'Failed to save message.' });
    }

    // 2. Send Email
    const mailOptions = {
        from: `"${name}" <${email}>`, // verified sender usually required, but this formats the "from" header
        to: process.env.EMAIL_USER, // Send to yourself
        replyTo: email, // Valid way to handle contact forms
        subject: `New Contact Form Message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `<p><strong>Name:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Message:</strong></p>
               <p>${message}</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully via Gmail');
        res.json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Failed to send email. Check server logs.' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
