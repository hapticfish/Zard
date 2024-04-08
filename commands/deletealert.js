const AlertModel = require('../database/alertModel'); // Adjust path as necessary

module.exports = {
    name: 'deletealert',
    execute: async (message, args) => {
        if (args.length < 1) {
            return message.channel.send('Usage: !deletealert <alert_id> [<alert_id> ...]');
        }

        const alertId = args[0];
        const userId = message.author.id; // Assuming Discord user ID matches user_id in your alerts table
        let responseMessage = ''; // To accumulate responses for each alert ID

        for (const alertId of args) {
            try {
                // Optionally, verify the alert belongs to the user before deactivation
                const alertExists = await AlertModel.verifyAlertOwnership(userId, alertId);
                if (!alertExists) {
                    responseMessage += `Alert ID ${alertId} not found or does not belong to you.\n`;
                    continue;
                }

                await AlertModel.deactivateAlert(alertId, 'user_canceled');
                responseMessage += `Alert ID ${alertId} has been successfully deactivated.\n`;
            } catch (error) {
                console.error(`Failed to deactivate alert ID ${alertId}:`, error);
                responseMessage += `Failed to deactivate alert ID ${alertId}.\n`;
            }
        }

        // Send accumulated response messages to the user
        message.channel.send(responseMessage.trim());
    },
};
