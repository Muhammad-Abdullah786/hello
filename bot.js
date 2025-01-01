import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import stripePackage from 'stripe';
import dotenv from 'dotenv';
import express from 'express';

const app = express();
const port = 3000;

// Load environment variables
dotenv.config();

const geminiApiKey = process.env.GEMINI_API_KEY
const telegramToken = process.env.TELEGRAM_TOKEN
const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);

// Create a bot instance using polling method
const bot = new TelegramBot(telegramToken, { polling: true });

// Function to get a response from Gemini API
const getGeminiResponse = async (userMessage) => {
    console.log(`User's message: ${userMessage}`);
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
            {
                contents: [
                    {
                        parts: [
                            { text: userMessage } // Format the message content as required
                        ]
                    }
                ],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000, // 10 seconds
            }
        );

        // Extract and return the response
        const geminiResponse = response.data.candidates[0].content.parts[0].text.trim();
        console.log(`Gemini response: ${geminiResponse}`);
        return geminiResponse;
    } catch (error) {
        console.error('Error from Gemini API:', error.message);
        return "Sorry, I couldn't process your request at the moment.";
    }
};

// Function to create Stripe checkout session
const createCheckoutSession = async (chatId) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',    
                        product_data: {
                            name: 'Daily Access to Bot',
                        },
                        unit_amount: 500, // $5 USD
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',  // One-time payment
            success_url: `${process.env.BASE_URL}/success?chatId=${chatId}`,
            cancel_url: `${process.env.BASE_URL}/cancel?chatId=${chatId}`,
        });

        return session.url;
    } catch (error) {
        console.error('Error creating Stripe session:', error.message);
        return null;
    }
};

// Listen for incoming messages
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    // Handle the /start command
    if (messageText === '/start') {
        await bot.sendMessage(chatId, 'Welcome to the Bot! Ask me anything!');
        console.log(`The chat ID is: ${chatId}`);
    }
    // Handle the /subscribe command
    else if (messageText === '/subscribe') {
        const checkoutUrl = await createCheckoutSession(chatId);

        if (checkoutUrl) {
            await bot.sendMessage(chatId, 'Click below to subscribe for daily access ($5 USD):');
            await bot.sendMessage(chatId, checkoutUrl);
        } else {
            await bot.sendMessage(chatId, 'Sorry, something went wrong while processing your payment request.');
        }
    }
    // Handle other messages by calling Gemini API
    else {
        const geminiResponse = await getGeminiResponse(messageText || '');
        console.log(`User's message: ${messageText}`);
        await bot.sendMessage(chatId, geminiResponse);
    }
});

// Endpoint to handle success after payment (this should be set up in your server)
app.get('/success', (req, res) => {
    const chatId = req.query.chatId;

    bot.sendMessage(chatId, 'Payment successful! You now have daily access to the bot.');
    res.send('Payment successful! Access granted.');
});

// Endpoint to handle cancel scenario after payment
app.get('/cancel', (req, res) => {
    const chatId = req.query.chatId;

    bot.sendMessage(chatId, 'Payment cancelled. You can try subscribing again.');
    res.send('Payment cancelled.');
});

// Start the server (example: express server)

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});



// import TelegramBot from 'node-telegram-bot-api';
// import axios from 'axios';

// // Gemini API key
// const geminiApiKey = "AIzaSyC3lZGdRFUnQBxZOu9kT0fjL2qgPGBCTLU";
// const telegramToken = "7416994828:AAEliKcJWZXcID1oNyNe-lMcy4gOiG9EuQE";

// // Create a bot instance using polling method
// const bot = new TelegramBot(telegramToken, { polling: true });

// // Function to get a response from Gemini
// const getGeminiResponse = async (userMessage) => {
//     console.log(`User's message: ${userMessage}`);
//     try {
//         const response = await axios.post(
//             `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, // Add API key to the URL
//             {
//                 contents: [
//                     {
//                         parts: [
//                             { text: userMessage } // Format the message content as required
//                         ]
//                     }
//                 ],
//             },
//             {
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 timeout: 10000, // 10 seconds
//             }
//         );

//         // Adjust the response handling based on Gemini's response format
//         const geminiResponse = response.data.candidates[0].content.parts[0].text.trim(); // Correct response handling
//         console.log(`Gemini response: ${geminiResponse}`);
//         return geminiResponse;
//     } catch (error) {
//         console.error('Error from Gemini API:', error.message);
//         return "Sorry, I couldn't process your request at the moment.";
//     }
// };

// // Listen for incoming messages
// bot.on('message', async (msg) => {
//     const chatId = msg.chat.id;
//     const messageText = msg.text;

//     // Handle the /start command
//     if (messageText === '/start') {
//         await bot.sendMessage(chatId, 'Welcome to the Bot! Ask me anything!');
//         console.log(`The chat ID is: ${chatId}`);
//     } else {
//         const geminiResponse = await getGeminiResponse(messageText || '');
//         console.log(`User's message: ${messageText}`);
//         await bot.sendMessage(chatId, geminiResponse);
//     }
// });


// todo: below is chatgpt
// import TelegramBot from 'node-telegram-bot-api';
// import axios from 'axios';
// const telegramToken = "7416994828:AAEliKcJWZXcID1oNyNe-lMcy4gOiG9EuQE"
// const openaiApiKey = "GEMINI_API_KEY=AIzaSyADD89uZ53un5A579Vk4_Fta4i7xiARJIk"

// // Create a bot instance using polling method
// const bot = new TelegramBot(telegramToken, { polling: true });

// // Function to get a response from ChatGPT
// const getChatGPTResponse = async (userMessage) => {
//     console.log(`the user msg is : ${userMessage}`)
//     try {

//         const response = await axios.post(
//             'https://api.openai.com/v1/chat/completions',
//             { model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: userMessage }] },
//             {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     Authorization: `Bearer ${openaiApiKey}`,
//                 },
//                 timeout: 10000, // 10 seconds
//             }
//         );

//         // Extract and return the ChatGPT response
//         console.log(`the response is : ${response.data.choices[0].message.content.trim()}`)
//         return response.data.choices[0].message.content.trim();
//     } catch (error) {
//         console.error('Error  from chat gpt fetching ChatGPT response:', error.message);
//         return "Sorry, I couldn't process your request at the moment.";
//     }
// };

// // Listen for any incoming messages
// bot.on('message', async (msg) => {
//     const chatId = msg.chat.id;
//     const messageText = msg.text;

//     // Handle the /start command
//     if (messageText === '/start') {
//         await bot.sendMessage(chatId, 'Welcome to the Ken Bot! Ask me anything!');
//         console.log(`the chat id is : ${chatId}`)
//     } else {
//         const chatGPTResponse = await getChatGPTResponse(messageText || '');
//         console.log(`the message is ${messageText}`)
//         await bot.sendMessage(chatId, chatGPTResponse);
//     }
// });
