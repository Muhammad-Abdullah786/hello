import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const geminiApiKey = process.env.GEMINI_API_KEY;

export const getGeminiResponse = async (userMessage) => {
    console.log(`User's message: ${userMessage}`);
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
            {
                contents: [
                    {
                        parts: [
                            { text: userMessage }
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

        const geminiResponse = response.data.candidates[0].content.parts[0].text.trim();
        console.log(`Gemini response: ${geminiResponse}`);
        return geminiResponse;
    } catch (error) {
        console.error('Error from Gemini API:', error.message);
        return "Sorry, I couldn't process your request at the moment.";
    }
};
