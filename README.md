# Personal Portfolio Platform

## Project Overview
This is a Personal Portfolio website built with **Node.js, Express, and Vanilla HTML/CSS/JS**.
It features a contact form that:
1.  **Sends Emails**: Uses `nodemailer` to send emails to the site owner.
2.  **Saves Messages**: Uses `mongoose` to save messages to a **MongoDB** database.

## Deployment Status
- **Repository**: [https://github.com/vijaysandilya/productdesign.git](https://github.com/vijaysandilya/productdesign.git)
- **Hosting**: **Vercel** (Serverless Function for API).
- **Database**: **MongoDB Atlas**.

## Configuration (Environment Variables)
The application requires the following Environment Variables (locally in `.env`, production in Vercel Settings):

| Variable | Description | Example / Note |
| :--- | :--- | :--- |
| `PORT` | Local server port | `3000` |
| `EMAIL_USER` | Gmail address for sending notifications | `your-email@gmail.com` |
| `EMAIL_PASS` | **Google App Password** (16 chars) | `xxxx xxxx xxxx xxxx` |
| `MONGODB_URI`| Connection string for MongoDB Atlas | `mongodb+srv://admin...` |

## Project Structure
- `src/server.js`: Main Express application. Handles API routes (`/api/contact`) and DB connection.
- `public/`: Static frontend assets (HTML, CSS, JS).
- `vercel.json`: Configuration for Vercel deployment.

## How to Run Locally
1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the server:
    ```bash
    npm run start
    ```
    OR (for development with auto-reload):
    ```bash
    npm run dev
    ```
3.  Visit `http://localhost:3000`.

## Recent Changes (Jan 2026)
- **Deployment**: Configured for Vercel (added `vercel.json`).
- **Persistence**: Removed local file system storage (`messages.json` is incompatible with Vercel).
- **Database**: Added MongoDB integration for persistent message storage.
