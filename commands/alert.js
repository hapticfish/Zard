// commands/alert.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { subscribeToPair } = require('../services/websocketService');
const AlertModel = require('../database/alertModel');
const { formatPairForAllExchanges, truncateToFiveDec } = require('../utils/currencyUtils');
const { createFlexibleAlertCallback } = require('../utils/callbackFactory');

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
                .addChoice('above', 'above')
                .addChoice('below', 'below'))
        .addNumberOption(option =>
            option.setName('target_price')
                .setDescription('Target price for the alert')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('alert_type')
                .setDescription('Type of alert (standard or perpetual)')
                .setRequired(true)
                .addChoice('standard', 'standard')
                .addChoice('perpetual', 'perpetual')),
    async execute(interaction) {
        const cryptoPair = interaction.options.getString('crypto_pair');
        const direction = interaction.options.getString('direction');
        const targetPrice = interaction.options.getNumber('target_price');
        const alertType = interaction.options.getString('alert_type');

        const formattedPair = formatPairForAllExchanges(cryptoPair.replace(/[-\s]/g, '').toUpperCase()).BINANCE;

        try {
            const alert = await AlertModel.addAlert(interaction.user.id, formattedPair, targetPrice, direction, alertType);
            await interaction.reply(`Alert set for ${formattedPair} when price goes ${direction} ${targetPrice}. Type: ${alertType}.`);

            subscribeToPair(formattedPair, alert.id, targetPrice, direction, alertType, createFlexibleAlertCallback({
                formattedPair: formattedPair,
                targetPrice: targetPrice,
                direction: direction,
                alertType: alertType,
                interaction: interaction, // Pass the interaction object for user interaction
                timestamp: () => new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error setting up alert:', error);
            await interaction.reply('There was an error setting up your alert. Please try again.');
        }
    }
};
