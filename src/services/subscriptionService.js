// subscriptionService.js

let userSubscriptions = {}; // In-memory storage for user subscriptions (replace with your DB)

const subscriptionDuration = 24 * 60 * 60 * 1000; // change to 24 * 60 * 60 * 1000 for 24 hours

// Set the subscription expiry time when the user subscribes
export const setUserSubscriptionExpiry = (chatId) => {
    const currentTime = Date.now();
    userSubscriptions[chatId] = currentTime + subscriptionDuration; // Set expiry to 24 hours from now
};

// Check if the user's subscription is valid
export const isUserSubscribed = (chatId) => {
    const subscriptionExpiry = userSubscriptions[chatId];
    if (!subscriptionExpiry) {
        return false; // No subscription
    }

    if (Date.now() > subscriptionExpiry) {
        // Subscription expired
        delete userSubscriptions[chatId]; // Clean up expired subscription
        return false;
    }

    return true;
};

// Mark user as subscribed (e.g., after successful payment)
export const markUserAsSubscribed = (chatId) => {
    setUserSubscriptionExpiry(chatId);
};

// Notify user when their subscription expires
export const notifyUserSubscriptionExpired = (chatId, bot) => {
    bot.sendMessage(chatId, "Your subscription has expired. Please renew to continue using the bot.");
    delete userSubscriptions[chatId]; // Remove expired subscription
};

// Export the userSubscriptions object to access it in other files
export { userSubscriptions };
