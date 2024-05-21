const { SlashCommandBuilder } = require('@discordjs/builders');
const AlertModel = require('../database/alertModel'); // Ensure the path is accurate
const commandUsageModel = require('../database/commandUsageModel'); // Import the command usage model

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
            const startTime = Date.now(); // Start time for response time calculation
            try {
                // Optionally, verify the alert belongs to the user before deactivation
                const alertExists = await AlertModel.verifyAlertOwnership(userId, alertId);
                if (!alertExists) {
                    responseMessage += `Alert ID ${alertId} not found or does not belong to you.\n`;
                    continue;
                }

                await AlertModel.deactivateAlert(alertId, 'user_canceled');
                responseMessage += `Alert ID ${alertId} has been successfully deactivated.\n`;

                const endTime = Date.now();
                const responseTime = endTime - startTime;

                // Log successful command usage
                await commandUsageModel.logCommandUsage({
                    userID: interaction.user.id,
                    commandID: interaction.commandId,
                    commandName: interaction.commandName,
                    description: 'Deletes one or more alerts by their IDs.',
                    timestamp: new Date(),
                    guildID: interaction.guildId,
                    channelID: interaction.channelId,
                    parameters: JSON.stringify(interaction.options.data),
                    success: true,
                    errorCode: null,
                    responseTime: responseTime
                });


            } catch (error) {
                console.error(`Failed to deactivate alert ID ${alertId}:`, error);
                responseMessage += `Failed to deactivate alert ID ${alertId}.\n`;

                const endTime = Date.now();
                const responseTime = endTime - startTime;

                // Log successful command usage
                await commandUsageModel.logCommandUsage({
                    userID: interaction.user.id,
                    commandID: interaction.commandId,
                    commandName: interaction.commandName,
                    description: 'Deletes one or more alerts by their IDs.',
                    timestamp: new Date(),
                    guildID: interaction.guildId,
                    channelID: interaction.channelId,
                    parameters: JSON.stringify(interaction.options.data),
                    success: false,
                    errorCode: error.message,
                    responseTime: responseTime
                });

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
