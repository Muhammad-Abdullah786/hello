import dotenv from 'dotenv';
import stripePackage from 'stripe';

dotenv.config();

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (chatId) => {
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
            success_url: `${process.env.BASE_URL}/payment/success?chatId=${chatId}`,
            cancel_url: `${process.env.BASE_URL}/payment/cancel?chatId=${chatId}`,
        });

        return session.url;
    } catch (error) {
        console.error('Error creating Stripe session:', error.message);
        return null;
    }
};
