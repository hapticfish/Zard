const { subscribeToPair } = require('../services/websocketService');
const AlertModel = require('../database/alertModel');
const { formatPairForAllExchanges, truncateToFiveDec } = require('../utils/currencyUtils');

module.exports = {
    name: 'alert',
    execute: async (message, args) => {
        if (args.length < 3) {
            return message.channel.send('Usage: !alert <crypto_pair> <direction> <target_price>');
        }

        const [cryptoPair, direction, targetPriceInput] = args;
        if (!["above", "below"].includes(direction)) {
            return message.channel.send('Direction must be either "above" or "below".');
        }

        const targetPrice = parseFloat(targetPriceInput);
        if (isNaN(targetPrice)) {
            return message.channel.send('Please provide a valid target price.');
        }

        const formattedPair = formatPairForAllExchanges(cryptoPair.replace(/[-\s]/g, '').toUpperCase()).BINANCE;

        AlertModel.addAlert(message.author.id, formattedPair, targetPrice, direction)
            .then(alert => {
                message.channel.send(`Alert set for ${formattedPair} when price goes ${direction} ${targetPrice}.`);

                subscribeToPair(formattedPair, alert.id, targetPrice, direction, async (newPrice) => {
                    try {
                        await AlertModel.triggerAlert(alert.id);
                        await message.author.send(`Alert: ${formattedPair} has moved ${direction} your target price of ${targetPrice}. Current price: ${truncateToFiveDec(newPrice)}.`);
                        // Optionally, deactivate the alert here
                        // await AlertModel.deactivateAlert(alert.id, "Triggered");
                    } catch (error) {
                        console.error('Error handling triggered alert:', error);
                    }
                });
            })
            .catch(error => {
                console.error('Error setting up alert:', error);
                message.channel.send('There was an error setting up your alert. Please try again.');
            });
    },
};
