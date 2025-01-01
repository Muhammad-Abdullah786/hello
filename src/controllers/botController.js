import dotenv from 'dotenv';
import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import { getGeminiResponse } from '../services/geminiService.js';
import { createCheckoutSession } from '../services/stripeService.js';
import { isUserSubscribed, markUserAsSubscribed, notifyUserSubscriptionExpired, userSubscriptions } from '../services/subscriptionService.js'; // Import subscription functions

dotenv.config();

const router = express.Router();
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// Handle incoming messages
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    // If the user is not subscribed, only allow the /subscribe command
    if (!isUserSubscribed(chatId)) {
        if (messageText === '/start') {
            // If not subscribed, send a welcome message and prompt to subscribe
            await bot.sendMessage(chatId, 'Welcome! You need to subscribe first to use the bot.');
        } else if (messageText === '/subscribe') {
            // Send the subscription link if the user requests it
            const checkoutUrl = await createCheckoutSession(chatId);
            if (checkoutUrl) {
                await bot.sendMessage(chatId, 'Click below to subscribe for daily access ($5 USD):');
                await bot.sendMessage(chatId, checkoutUrl);
            } else {
                await bot.sendMessage(chatId, 'Sorry, something went wrong while processing your payment request.');
            }
        } else {
            // If user sends any message other than /subscribe or /start, remind them to subscribe
            await bot.sendMessage(chatId, 'You need to subscribe first to use this feature. Please type /subscribe to proceed.');
        }
    } else {
        // If the user is subscribed, allow them to interact with the bot
        if (messageText === '/start') {
            await bot.sendMessage(chatId, 'Welcome back! You have access to the bot.');
        } else {
            try {
                // Handle the user's message by calling Gemini API
                const geminiResponse = await getGeminiResponse(messageText || '');
                await bot.sendMessage(chatId, geminiResponse);
            } catch (error) {
                console.error('Error interacting with Gemini API:', error);
                await bot.sendMessage(chatId, "Sorry, there was an issue with processing your request.");
            }
        }
    }
});

// Set an interval to check and notify users with expired subscriptions
setInterval(() => {
    // Iterate over all users and check if their subscription has expired
    Object.keys(userSubscriptions).forEach(async (chatId) => {
        if (!isUserSubscribed(chatId)) {
            await notifyUserSubscriptionExpired(chatId, bot); // Notify the user if the subscription has expired
        }
    });
}, 60 * 60 * 1000); // Check every hour (60000 ms for 1 minute, 3600000 ms for 1 hour)

export default router;
