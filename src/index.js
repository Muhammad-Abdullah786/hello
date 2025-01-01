import express from 'express';
import dotenv from 'dotenv';
// import TelegramBot from 'node-telegram-bot-api';
import botController from './controllers/botController.js';
import paymentController from './controllers/paymentController.js';

dotenv.config();

// Initialize Express app
const app = express();
const port = 9000;

// Set up routes
app.use('/payment', paymentController); // Payment-related routes
app.use('/bot', botController);         // Telegram bot-related routes

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
