// CallbackFactory.js
const AlertModel = require('./database/alertModel');
//might need to handle turnicate price function in here.
function createFlexibleAlertCallback(context) {
    return async function alertCallback(newPrice, alertId) {
        console.log(`Alert triggered for ${context.formattedPair} at price: ${newPrice}`);

        try {
            await AlertModel.triggerAlert(alertId);

            if (context.alertType === 'standard') {
                if (context.message) {
                    await context.message.author.send(`Alert: ${context.formattedPair} has moved ${context.direction} your target price of ${context.targetPrice}. Current price: ${newPrice}. Type: ${context.alertType}.`);
                }
                console.log(`Alert ${alertId} notification sent to the user.`);
                await AlertModel.deactivateAlert(alertId, "Triggered");
                console.log(`Standard alert ${alertId} deactivated.`);
            } else if (context.alertType === 'perpetual') {
                if (context.message) {
                    await context.message.author.send(`Alert: ${context.formattedPair} has crossed your target price of ${context.targetPrice}. Current price: ${newPrice}. Type: ${context.alertType}.`);
                }
                console.log(`Alert ${alertId} notification sent to the user.`);
                console.log(`Perpetual alert ${alertId} triggered and active.`);
            }
        } catch (error) {
            console.error('Error handling triggered alert:', error);
        }
    }
}

module.exports = { createFlexibleAlertCallback };
