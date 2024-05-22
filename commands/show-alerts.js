const { SlashCommandBuilder } = require('@discordjs/builders');
const AlertModel = require('../database/alertModel'); // Ensure the path is accurate
const moment = require('moment');
const commandUsageModel = require("../database/commandUsageModel");
const {updateLastBotInteraction} = require("../database/databaseUtil");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('show-alerts')
        .setDescription('Show a list of all your active alerts.'),
    async execute(interaction) {
        await updateLastBotInteraction(interaction.user.id);
        const userId = interaction.user.id; // Get user ID from interaction


        const startTime = Date.now(); // Start time for response time calculation
        try {
            const alerts = await AlertModel.getActiveAlerts(userId);
            if (alerts.length === 0) {
                await interaction.reply({content: 'You have no active alerts.', ephemeral: true });

                const endTime = Date.now();
                const responseTime = endTime - startTime;

                // Log successful command usage
                await commandUsageModel.logCommandUsage({
                    userID: interaction.user.id,
                    commandID: interaction.commandId,
                    commandName: interaction.commandName,
                    description: 'Show a list of all your active alerts.',
                    timestamp: new Date(),
                    guildID: interaction.guildId,
                    channelID: interaction.channelId,
                    parameters: JSON.stringify(interaction.options.data),
                    success: true,
                    errorCode: null,
                    responseTime: responseTime
                });

                return;
            }

            let response = 'Your active alerts:\n```\nID | Pair | Target Price | Direction | Type | Status | Created At\n';
            alerts.forEach(({ id, crypto_pair, target_price, direction, alert_type, status, creation_date }) => {
                // Format creation date using moment for simplified output
                const formattedDate = moment(creation_date).format('YYYY-MM-DD HH:mm:ss');
                response += `${id} | ${crypto_pair} | ${target_price} | ${direction} | ${alert_type} | ${status} | ${formattedDate}\n`;
            });
            response += '```';

            await interaction.reply({content: response, ephemeral: true });

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Log successful command usage
            await commandUsageModel.logCommandUsage({
                userID: interaction.user.id,
                commandID: interaction.commandId,
                commandName: interaction.commandName,
                description: 'Show a list of all your active alerts.',
                timestamp: new Date(),
                guildID: interaction.guildId,
                channelID: interaction.channelId,
                parameters: JSON.stringify(interaction.options.data),
                success: true,
                errorCode: null,
                responseTime: responseTime
            });

        } catch (error) {
            console.error('Failed to retrieve alerts:', error);
            await interaction.reply({content: 'Failed to retrieve alerts. Please try again later.', ephemeral: true });

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Log failed command usage
            await commandUsageModel.logCommandUsage({
                userID: interaction.user.id,
                commandID: interaction.commandId,
                commandName: interaction.commandName,
                description: 'Show a list of all your active alerts.',
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
};
