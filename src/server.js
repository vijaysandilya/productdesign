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

// Database Configuration (MongoDB)
const mongoose = require('mongoose');

// Connect to MongoDB
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => console.error('Could not connect to MongoDB:', err));
} else {
    console.warn('MONGODB_URI not found in environment variables. Messages will not be saved to DB.');
}

// Message Schema
const messageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// API Endpoint
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // 1. Save to Database (MongoDB)
    try {
        if (mongoose.connection.readyState === 1) { // Check if connected
            const newMessage = new Message({ name, email, message });
            await newMessage.save();
            console.log('Message saved to database');
        } else {
            console.warn('Database not connected, skipping save.');
        }
    } catch (dbError) {
        console.error('Error saving to database:', dbError);
    }

    // 2. Send Email (Priority)
    const mailOptions = {
        from: `"${name}" <${email}>`, // Note: Gmail often overrides this to the auth user, but it's good practice
        to: process.env.EMAIL_USER, // Send to yourself
        replyTo: email,
        subject: `New Contact Form Message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `<p><strong>Name:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Message:</strong></p>
               <p>${message}</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        res.json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        // Do not expose internal error details to client, but give a hint
        res.status(500).json({ success: false, message: 'Failed to send email. Ensure server email configuration is correct.' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
