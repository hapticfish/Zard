const { SlashCommandBuilder } = require('@discordjs/builders');
const AlertModel = require('../database/alertModel');
const commandUsageModel = require("../database/commandUsageModel");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-all-alerts')
        .setDescription('Deletes all alerts set by the user.'),
    async execute(interaction) {
        const userId = interaction.user.id; // This gets the ID of the user who invoked the slash command

        const startTime = Date.now(); // Start time for response time calculation
        try {
            await AlertModel.deactivateAllAlerts(userId, 'User deactivated all alerts');
            await interaction.reply('All your alerts have been successfully deleted.');

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Log successful command usage
            await commandUsageModel.logCommandUsage({
                userID: interaction.user.id,
                commandID: interaction.commandId,
                commandName: interaction.commandName,
                description: 'Deletes all alerts set by the user.',
                timestamp: new Date(),
                guildID: interaction.guildId,
                channelID: interaction.channelId,
                parameters: JSON.stringify(interaction.options.data),
                success: true,
                errorCode: null,
                responseTime: responseTime
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to delete alerts. Please try again later.', ephemeral: true });

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Log successful command usage
            await commandUsageModel.logCommandUsage({
                userID: interaction.user.id,
                commandID: interaction.commandId,
                commandName: interaction.commandName,
                description: 'Deletes all alerts set by the user.',
                timestamp: new Date(),
                guildID: interaction.guildId,
                channelID: interaction.channelId,
                parameters: JSON.stringify(interaction.options.data),
                success: false,
                errorCode: error.message,
                responseTime: responseTime
            });

        }
    },
};
