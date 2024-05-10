const { SlashCommandBuilder } = require('@discordjs/builders');
const AlertModel = require('../database/alertModel'); // Ensure the path is accurate

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-alert')
        .setDescription('Deletes one or more alerts by their IDs.')
        .addStringOption(option =>
            option.setName('alert_ids')
                .setDescription('Enter the alert ID(s) to delete, separated by spaces')
                .setRequired(true)),
    async execute(interaction) {
        const alertIdsInput = interaction.options.getString('alert_ids');
        const alertIds = alertIdsInput.split(' '); // Split input by spaces to handle multiple IDs
        const userId = interaction.user.id;
        let responseMessage = '';

        for (const alertId of alertIds) {
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

        // Respond to the interaction
        if (responseMessage === '') {
            await interaction.reply('No valid alert IDs provided or no alerts matched your IDs.');
        } else {
            await interaction.reply(responseMessage.trim());
        }
    }
};
