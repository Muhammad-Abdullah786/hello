import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);

export const sendPaymentSuccessMessage = (chatId) => {
    bot.sendMessage(chatId, 'Payment successful! You now have daily access to the bot.');
};

export const sendPaymentCancelMessage = (chatId) => {
    bot.sendMessage(chatId, 'Payment cancelled. You can try subscribing again.');
};
