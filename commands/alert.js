const { subscribeToPair } = require('../services/websocketService');
const AlertModel = require('../database/alertModel');
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

        // Adding the alert to the database
        AlertModel.addAlert(message.author.id, formattedPair, targetPrice, 'above') // Assuming direction is 'above'
            .then(alert => {
                message.channel.send(`Alert set for ${formattedPair} to reach ${targetPrice}.`);

                // Subscribing to real-time updates for the crypto pair
                subscribeToPair(formattedPair, (newPrice) => {
                    const price = parseFloat(newPrice);
                    if ((targetPrice >= price) || (targetPrice <= price)) {
                        try {
                            message.author.send(`Alert: ${formattedPair} has reached your target price of ${targetPrice}. Current price: ${truncateToFiveDec(price)}.`);
                            // Deactivating the alert in the database
                            AlertModel.deactivateAlert(alert.id)
                                .then(() => console.log(`Alert ${alert.id} deactivated`))
                                .catch(error => console.error('Error deactivating alert:', error));
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
