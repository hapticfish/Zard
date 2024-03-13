const { subscribeToPair } = require('../services/websocketService');
const { addAlert } = require('../models'); // Adjust based on your actual database integration
const { formatPairForAllExchanges, truncateToFiveDec } = require('../utils/currencyUtils');

module.exports = {
    name: 'alert',
    execute: async (message, args) => {
        if (args.length < 3) {
            return message.channel.send('Usage: !alert <crypto_pair> <target_price>');
        }

        const [cryptoPair, targetPriceInput] = args;
        const targetPrice = parseFloat(targetPriceInput);
        if (isNaN(targetPrice)) {
            return message.channel.send('Please provide a valid target price.');
        }

        const formattedPair = formatPairForAllExchanges(cryptoPair.replace(/[-\s]/g, '').toUpperCase()).BINANCE;

        // Assume addAlert function saves the alert config and returns a success status or the saved alert object
        addAlert(message.author.id, formattedPair, targetPrice)
            .then(() => {
                message.channel.send(`Alert set for ${formattedPair} to reach ${targetPrice}.`);

                // Subscribe to pair for real-time updates
                subscribeToPair(formattedPair, (newPrice) => {
                    const price = parseFloat(newPrice);
                    if ((targetPrice >= price) || (targetPrice <= price)) {
                        try {
                            message.author.send(`Alert: ${formattedPair} has reached your target price of ${targetPrice}. Current price: ${price}.`);
                            // Here, include logic to update or deactivate the alert in your database to avoid repeated notifications
                        } catch (error) {
                            console.error('Error sending alert notification:', error);
                        }
                    }
                });
            })
            .catch(error => {
                console.error('Error setting up alert:', error);
                message.channel.send('There was an error setting up your alert. Please try again.');
            });
    },
};
