const { subscribeToPair } = require('../services/websocketService');
const AlertModel = require('../database/alertModel');
const { formatPairForAllExchanges, truncateToFiveDec } = require('../utils/currencyUtils');
const { createFlexibleAlertCallback } = require('../utils/callbackFactory');

module.exports = {
    name: 'alert',
    execute: async (message, args) => {
        console.log(`Alert command received with args: ${args.join(', ')}`);

        // Adjusted for an additional argument for alert type
        if (args.length < 4) {
            console.log('Insufficient arguments for alert command.');
            return message.channel.send('Usage: !alert <crypto_pair> <direction> <target_price> <alert_type>');
        }

        const [cryptoPair, direction, targetPriceInput, alertType] = args;
        if (!["above", "below"].includes(direction)) {
            console.log('Invalid direction argument for alert command.');
            return message.channel.send('Direction must be either "above" or "below".');
        }

        // Ensuring the alertType is either "standard" or "perpetual"
        if (!["standard", "perpetual"].includes(alertType)) {
            console.log('Invalid alert type argument for alert command.');
            return message.channel.send('Alert type must be either "s" for standard alert or "p" for perpetual alert.');
        }

        const targetPrice = parseFloat(targetPriceInput);
        if (isNaN(targetPrice)) {
            console.log('Invalid target price argument for alert command.');
            return message.channel.send('Please provide a valid target price.');
        }

        const formattedPair = formatPairForAllExchanges(cryptoPair.replace(/[-\s]/g, '').toUpperCase()).BINANCE;
        console.log(`Formatted pair: ${formattedPair}, Direction: ${direction}, Target Price: ${targetPrice}, Alert Type: ${alertType}`);

        try {
            const alert = await AlertModel.addAlert(message.author.id, formattedPair, targetPrice, direction, alertType); // Passing alertType to addAlert
            console.log(`Alert added to database:`, alert);

            message.channel.send(`Alert set for ${formattedPair} when price goes ${direction} ${targetPrice}. Type: ${alertType}.`)
                .then(() => console.log(`Alert setup confirmation sent to user ID: ${message.author.id}`))
                .catch(error => console.error(`Failed to send setup confirmation to user ID: ${message.author.id}`, error));


            subscribeToPair(formattedPair, alert.id, targetPrice, direction, alertType, createFlexibleAlertCallback({
                formattedPair: formattedPair,
                targetPrice: targetPrice,
                direction: direction,
                alertType: alertType,
                message: message, // Pass the Discord message object for user interaction
                timestamp: () => new Date().toISOString()
            }));
        } catch (error){
            console.error('Error setting up alert:', error);
            message.channel.send('There was an error setting up your alert. Please try again.');
        }

    }
};
