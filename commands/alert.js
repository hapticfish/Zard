// commands/alert.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { subscribeToPair } = require('../services/websocketService');
const AlertModel = require('../database/alertModel');
const { formatPairForAllExchanges, truncateToFiveDec } = require('../utils/currencyUtils');
const { createFlexibleAlertCallback } = require('../utils/callbackFactory');
const { logCommandUsage } = require('../database/commandUsageModel');
const {updateLastBotInteraction} = require("../database/databaseUtil");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('alert')
        .setDescription('Set an alert for a cryptocurrency pair.')
        .addStringOption(option =>
            option.setName('crypto_pair')
                .setDescription('The cryptocurrency pair (e.g., BTCUSDT)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('direction')
                .setDescription('Alert direction (above or below)')
                .setRequired(true)
                .addChoices(
                    { name: 'Above', value: 'above' },
                    { name: 'Below', value: 'below' }
                ))
        .addNumberOption(option =>
            option.setName('target_price')
                .setDescription('Target price for the alert')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('alert_type')
                .setDescription('Type of alert (standard or perpetual)')
                .setRequired(true)
                .addChoices(
                    { name: 'Standard', value: 'standard' },
                    { name: 'Perpetual', value: 'perpetual' }
                )),
    async execute(interaction) {
        console.log(interaction); // Log the entire interaction object
        console.log(interaction.options); // Log all the options received

        await updateLastBotInteraction(interaction.user.id);

        const cryptoPair = interaction.options.getString('cryptopair');
        const direction = interaction.options.getString('direction');
        const targetPrice = interaction.options.getNumber('targetprice');
        const alertType = interaction.options.getString('alerttype');

        console.log(`cryptoPair: ${cryptoPair}, direction: ${direction}, targetPrice: ${targetPrice}, alertType: ${alertType}`);

        // Now you can proceed with your existing logic using these variables
        if (!cryptoPair || !direction || !targetPrice || !alertType) {
            console.error('One or more options are missing');
            await interaction.reply({ content: 'All options are required.', ephemeral: true });
            return;
        }

        const formattedPair = formatPairForAllExchanges(cryptoPair.replace(/[-\s]/g, '').toUpperCase()).BINANCE;
        console.log(`The formatted Pair:`, formattedPair);
        const startTime = Date.now();

        try {
            const alert = await AlertModel.addAlert(interaction.user.id, formattedPair, targetPrice, direction, alertType);
            console.log(`Alert added: User ${interaction.user.id}, Pair ${formattedPair}, Price ${targetPrice}, Direction ${direction}, Type ${alertType}`);
            await interaction.reply(`Alert set for ${formattedPair} ${direction} ${targetPrice}. Type: ${alertType}.`);

            subscribeToPair(formattedPair, alert.id, targetPrice, direction, alertType, createFlexibleAlertCallback({
                formattedPair: formattedPair,
                targetPrice: targetPrice,
                direction: direction,
                alertType: alertType,
                interaction: interaction, // Pass the interaction object for user interaction
                timestamp: () => new Date().toISOString()
            }));

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Log successful command usage
            await logCommandUsage({
                userID: interaction.user.id,
                commandID: interaction.commandId, // You might need to define or derive this
                commandName: interaction.commandName,
                description: 'Set an alert for a cryptocurrency pair',
                timestamp: new Date(),
                guildID: interaction.guildId,
                channelID: interaction.channelId,
                parameters: JSON.stringify(interaction.options.data), // Assuming interaction.options.data contains command parameters
                success: true,
                errorCode: null,
                responseTime: responseTime
            });

        } catch (error) {
            console.error('Alert setup error:', { userId: interaction.user.id, error: error.message });
            await interaction.reply('There was an error setting up your alert. Please try again.');

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Log failed command usage
            await logCommandUsage({
                userID: interaction.user.id,
                commandID: interaction.commandId,
                commandName: interaction.commandName,
                description: 'Set an alert for a cryptocurrency pair',
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
