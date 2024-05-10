const { SlashCommandBuilder } = require('@discordjs/builders');
// const fetch = require('node-fetch'); // Assuming 'node-fetch' is installed and can be required directly
const { formatPairForAllExchanges } = require('../utils/currencyUtils');

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
        const amount = interaction.options.getNumber('amount');
        const fromCurrency = interaction.options.getString('from_currency').toUpperCase();
        const toCurrency = interaction.options.getString('to_currency').toUpperCase();

        if (isNaN(amount)) {
            await interaction.reply('Please provide a valid amount for conversion.');
            return;
        }

        const fromPairSymbol = fromCurrency === 'USDT' ? 'USDT' : fromCurrency + 'USDT';
        const toPairSymbol = toCurrency === 'USDT' ? 'USDT' : toCurrency + 'USDT';

        let fetch;
        try {
            fetch = (await import('node-fetch')).default;
            let convertedAmount = amount;
            if (fromCurrency !== 'USDT') {
                const responseFrom = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${fromPairSymbol}`).then(res => res.json());
                if (!responseFrom.price) {
                    if (responseFrom.status === 451) {
                        await interaction.reply('Failed: restricted region access');
                        return;
                    }
                    await interaction.reply(`Could not fetch price for conversion from ${fromCurrency} to USDT.`);
                    return;
                }
                convertedAmount *= parseFloat(responseFrom.price);
            }

            if (toCurrency !== 'USDT') {
                const responseTo = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${toPairSymbol}`).then(res => res.json());
                if (!responseTo.price) {
                    if (responseTo.status === 451) {
                        await interaction.reply('Failed: restricted region access');
                        return;
                    }
                    await interaction.reply(`Could not fetch price for conversion from USDT to ${toCurrency}.`);
                    return;
                }
                convertedAmount *= 1 / parseFloat(responseTo.price);
            }

            console.log(`Successfully processed convert command. Amount: ${amount} From Currency: ${fromCurrency}, Converted Amount: ${convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 5, maximumFractionDigits: 5 })} ${toCurrency}`);
            await interaction.reply(`${amount} ${fromCurrency} is equivalent to ${convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 5, maximumFractionDigits: 5 })} ${toCurrency}.`);
        } catch (error) {
            console.error('Error fetching the conversion rate:', error);
            await interaction.reply('There was an error fetching the conversion rate.');
        }
    },
};
