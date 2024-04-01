const { subscribeToPair } = require('../services/websocketService');
const AlertModel = require('../database/alertModel');
const { formatPairForAllExchanges, truncateToFiveDec } = require('../utils/currencyUtils');

module.exports = {
    name: 'alert',
    execute: async (message, args) => {
        console.log(`Alert command received with args: ${args.join(', ')}`);

        if (args.length < 3) {
            console.log('Insufficient arguments for alert command.');
            return message.channel.send('Usage: !alert <crypto_pair> <direction> <target_price>');
        }

        const [cryptoPair, direction, targetPriceInput] = args;
        if (!["above", "below"].includes(direction)) {
            console.log('Invalid direction argument for alert command.');
            return message.channel.send('Direction must be either "above" or "below".');
        }

        const targetPrice = parseFloat(targetPriceInput);
        if (isNaN(targetPrice)) {
            console.log('Invalid target price argument for alert command.');
            return message.channel.send('Please provide a valid target price.');
        }

        const formattedPair = formatPairForAllExchanges(cryptoPair.replace(/[-\s]/g, '').toUpperCase()).BINANCE;
        console.log(`Formatted pair: ${formattedPair}, Direction: ${direction}, Target Price: ${targetPrice}`);

        try {
            const alert = await AlertModel.addAlert(message.author.id, formattedPair, targetPrice, direction);
            console.log(`Alert added to database:`, alert);

            message.channel.send(`Alert set for ${formattedPair} when price goes ${direction} ${targetPrice}.`);

            subscribeToPair(formattedPair, alert.id, targetPrice, direction, async (newPrice) => {
                console.log(`Alert triggered for ${formattedPair} at price: ${newPrice}`);

                try {
                    await AlertModel.triggerAlert(alert.id);
                    await message.author.send(`Alert: ${formattedPair} has moved ${direction} your target price of ${targetPrice}. Current price: ${truncateToFiveDec(newPrice)}.`);
                    console.log(`Alert ${alert.id} notification sent to the user.`);

                    // Deactivate the alert after it has been triggered and notification sent
                    await AlertModel.deactivateAlert(alert.id, "Triggered");
                    console.log(`Alert ${alert.id} deactivated.`);
                } catch (error) {
                    console.error('Error handling triggered alert:', error);
                }
            });
        } catch (error) {
            console.error('Error setting up alert:', error);
            message.channel.send('There was an error setting up your alert. Please try again.');
        }
    },
};
