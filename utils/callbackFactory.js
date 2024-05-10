const AlertModel = require('../database/alertModel');

function createFlexibleAlertCallback(context) {
    return async function alertCallback(newPrice, alertId) {
        console.log(`Alert triggered for ${context.formattedPair} at price: ${newPrice}`);

        const timestamp = context.timestamp();
        try {
            await AlertModel.triggerAlert(alertId);

            // Constructing the alert message
            const alertMessage = `Alert: ${context.formattedPair} has moved ${context.direction} to target ${context.targetPrice}. Current price: ${newPrice}. Type: ${context.alertType} Time: ${timestamp}.`;

            if (context.alertType === 'standard') {
                // Send DM to the user using interaction object
                if (context.interaction) {
                    await context.interaction.user.send(alertMessage);
                }
                console.log(`Alert ${alertId} notification sent to the user.`);
                await AlertModel.deactivateAlert(alertId, "Triggered");
                console.log(`Standard alert ${alertId} deactivated.`);
            } else if (context.alertType === 'perpetual') {
                // Perpetual alerts might require continuous notifications
                if (context.interaction) {
                    await context.interaction.user.send(alertMessage);
                }
                console.log(`Alert ${alertId} notification sent to the user.`);
                console.log(`Perpetual alert ${alertId} triggered and active.`);
            }
        } catch (error) {
            console.error('Error setting up alert:', error);
            if (context.interaction) {
                await context.interaction.user.send('There was an error setting up your alert. Please try again.')
                    .catch(err => console.error(`Failed to send error message to user ID: ${context.interaction.user.id}`, err));
            }
        }
    }
}

module.exports = { createFlexibleAlertCallback };
