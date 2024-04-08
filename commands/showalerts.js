const AlertModel = require('../database/alertModel'); // Adjust path as necessary

module.exports = {
    name: 'showalerts',
    execute: async (message) => {
        const userId = message.author.id; // Discord user ID

        try {
            const alerts = await AlertModel.getActiveAlerts(userId);
            if (alerts.length === 0) {
                return message.channel.send('You have no active alerts.');
            }

            let response = 'Your active alerts:\n```\nID | Pair | Target Price | Direction | Status\n';
            alerts.forEach(({ id, crypto_pair, target_price, direction, status }) => {
                response += `${id} | ${crypto_pair} | ${target_price} | ${direction} | ${status}\n`;
            });
            response += '```';

            message.channel.send(response);
        } catch (error) {
            console.error(error);
            message.channel.send('Failed to retrieve alerts.');
        }
    },
};
