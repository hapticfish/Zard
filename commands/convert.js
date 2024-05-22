
const { SlashCommandBuilder } = require('@discordjs/builders');
// const fetch = require('node-fetch'); // Assuming 'node-fetch' is installed and can be required directly
const { formatPairForAllExchanges } = require('../utils/currencyUtils');
const commandUsageModel = require('../database/commandUsageModel'); // Import the command usage model
const {updateLastBotInteraction} = require("../database/databaseUtil"); // Import the command usage model


module.exports = {
    data: new SlashCommandBuilder()
        .setName('convert')
        .setDescription('Converts an amount from one cryptocurrency to another.')
        .addNumberOption(option =>
            option.setName('amount')
                .setDescription('Amount to convert')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('from_currency')
                .setDescription('Currency to convert from')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('to_currency')
                .setDescription('Currency to convert to')
                .setRequired(true)),
    async execute(interaction) {
        await updateLastBotInteraction(interaction.user.id);
        const amount = interaction.options.getNumber('amount');
        const fromCurrency = interaction.options.getString('from_currency').toUpperCase();
        const toCurrency = interaction.options.getString('to_currency').toUpperCase();

        if (isNaN(amount)) {
            await interaction.reply({content: 'Please provide a valid amount for conversion.', ephemeral: true});
            return;
        }

        const fromPairSymbol = fromCurrency === 'USDT' ? 'USDT' : fromCurrency + 'USDT';
        const toPairSymbol = toCurrency === 'USDT' ? 'USDT' : toCurrency + 'USDT';

        let fetch;
        const startTime = Date.now(); // Start time for response time calculation
        try {
            fetch = (await import('node-fetch')).default;
            let convertedAmount = amount;
            if (fromCurrency !== 'USDT') {
                const responseFrom = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${fromPairSymbol}`).then(res => res.json());
                if (!responseFrom.price) {
                    if (responseFrom.status === 451) {
                        await interaction.reply({content: 'Failed: restricted region access', ephemeral: true});
                        return;
                    }
                    await interaction.reply({content: `Could not fetch price for conversion from ${fromCurrency} to USDT.`, ephemeral: true});
                    return;
                }
                convertedAmount *= parseFloat(responseFrom.price);
            }

            if (toCurrency !== 'USDT') {
                const responseTo = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${toPairSymbol}`).then(res => res.json());
                if (!responseTo.price) {
                    if (responseTo.status === 451) {
                        await interaction.reply({content: 'Failed: restricted region access', ephemeral: true});
                        return;
                    }
                    await interaction.reply({content: `Could not fetch price for conversion from USDT to ${toCurrency}.`, ephemeral: true});
                    return;
                }
                convertedAmount *= 1 / parseFloat(responseTo.price);
            }

            console.log(`Successfully processed convert command. Amount: ${amount} From Currency: ${fromCurrency}, Converted Amount: ${convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 5, maximumFractionDigits: 5 })} ${toCurrency}`);
            await interaction.reply({content: `${amount} ${fromCurrency} is equivalent to ${convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 5, maximumFractionDigits: 5 })} ${toCurrency}.`, ephemeral: true});

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Log successful command usage
            await commandUsageModel.logCommandUsage({
                userID: interaction.user.id,
                commandID: interaction.commandId,
                commandName: interaction.commandName,
                description: 'Converts an amount from one cryptocurrency to another.',
                timestamp: new Date(),
                guildID: interaction.guildId,
                channelID: interaction.channelId,
                parameters: JSON.stringify(interaction.options.data),
                success: true,
                errorCode: null,
                responseTime: responseTime
            });

        } catch (error) {
            console.error('Error fetching the conversion rate:', error);
            await interaction.reply({content: 'There was an error fetching the conversion rate.',ephemeral: true});

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Log failed command usage
            await commandUsageModel.logCommandUsage({
                userID: interaction.user.id,
                commandID: interaction.commandId,
                commandName: interaction.commandName,
                description: 'Converts an amount from one cryptocurrency to another.',
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
