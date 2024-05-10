const { SlashCommandBuilder } = require('@discordjs/builders');
const AlertModel = require('../database/alertModel'); // Ensure the path is accurate
const moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('show-alerts')
        .setDescription('Show a list of all your active alerts.'),
    async execute(interaction) {
        const userId = interaction.user.id; // Get user ID from interaction

        try {
            const alerts = await AlertModel.getActiveAlerts(userId);
            if (alerts.length === 0) {
                await interaction.reply('You have no active alerts.');
                return;
            }

            let response = 'Your active alerts:\n```\nID | Pair | Target Price | Direction | Type | Status | Created At\n';
            alerts.forEach(({ id, crypto_pair, target_price, direction, alert_type, status, creation_date }) => {
                // Format creation date using moment for simplified output
                const formattedDate = moment(creation_date).format('YYYY-MM-DD HH:mm:ss');
                response += `${id} | ${crypto_pair} | ${target_price} | ${direction} | ${alert_type} | ${status} | ${formattedDate}\n`;
            });
            response += '```';

            await interaction.reply(response);
        } catch (error) {
            console.error('Failed to retrieve alerts:', error);
            await interaction.reply('Failed to retrieve alerts. Please try again later.');
        }
    }
};
