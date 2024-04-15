// CallbackFactory.js
const AlertModel = require('../database/alertModel');
//might need to handle turnicate price function in here.
function createFlexibleAlertCallback(context) {
    return async function alertCallback(newPrice, alertId) {
        console.log(`Alert triggered for ${context.formattedPair} at price: ${newPrice}`);

        const timestamp = context.timestamp();
        try {
            await AlertModel.triggerAlert(alertId);

            if (context.alertType === 'standard') {
                if (context.message) {
                    await context.message.author.send(`Alert: ${context.formattedPair} has moved ${context.direction} to target ${context.targetPrice}. Current price: ${newPrice}. Type: ${context.alertType} Time: ${timestamp}.`);
                }
                console.log(`Alert ${alertId} notification sent to the user.`);
                await AlertModel.deactivateAlert(alertId, "Triggered");
                console.log(`Standard alert ${alertId} deactivated.`);
            } else if (context.alertType === 'perpetual') {
                if (context.message) {
                    await context.message.author.send(`Alert: ${context.formattedPair} has crossed ${context.targetPrice}. Current price: ${newPrice}. Type: ${context.alertType}Time: Time: ${timestamp}.`);
                }
                console.log(`Alert ${alertId} notification sent to the user.`);
                console.log(`Perpetual alert ${alertId} triggered and active.`);
            }
        } catch (error) {
            console.error('Error setting up alert:', error);
            context.message.channel.send('There was an error setting up your alert. Please try again.')
                .catch(err => console.error(`Failed to send error message to user ID: ${context.message.author.id}`, err));
        }
    }
}

module.exports = { createFlexibleAlertCallback };
