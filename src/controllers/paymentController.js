import express from 'express';
import TelegramBot from "node-telegram-bot-api";
import { markUserAsSubscribed } from '../services/subscriptionService.js';
import { sendPaymentSuccessMessage, sendPaymentCancelMessage } from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);
const router = express.Router();

// Endpoint for payment success
router.get('/success', (req, res) => {
    const chatId = req.query.chatId;

    // Mark the user as subscribed
    markUserAsSubscribed(chatId);

    sendPaymentSuccessMessage(chatId);
    res.send('Payment successful! Access granted.');
});

// Endpoint for payment cancellation
router.get('/cancel', (req, res) => {
    const chatId = req.query.chatId;

    sendPaymentCancelMessage(chatId);
    res.send('Payment cancelled.');
});

export default router;
