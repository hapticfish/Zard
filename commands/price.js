const { SlashCommandBuilder } = require('@discordjs/builders');
const { formatPairForAllExchanges, truncateToFiveDec } = require('../utils/currencyUtils');
const commandUsageModel = require("../database/commandUsageModel");

async function fetchWithLogging(url, exchange) {
    // Dynamically import node-fetch
    const fetch = (await import('node-fetch')).default;
    console.log(`Requesting data from ${exchange}: ${url}`);
    const response = await fetch(url);

    // Check for a 451 status code, indicating restricted region access
    if (response.status === 451) {
        throw new Error('451: Restricted Region');
    }

    const data = await response.json();
    console.log(`${exchange} raw data: `, JSON.stringify(data));
    return { exchange, data, status: response.status }; // Include status in return value
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('price')
        .setDescription('Fetches the current price of a specified cryptocurrency from multiple exchanges.')
        .addStringOption(option =>
            option.setName('symbol')
                .setDescription('Ticker symbol of the cryptocurrency (e.g., BTCUSDT, ETHUSDT).')
                .setRequired(true)),

    async execute(interaction) {
        const symbol = interaction.options.getString('symbol').toUpperCase();
        const normalizedPair = symbol.replace(/[-\s]/g, '').toUpperCase();
        const formattedPairs = formatPairForAllExchanges(normalizedPair);

        const apiUrls = {
            'BINANCE': `https://api.binance.com/api/v3/ticker/price?symbol=${formattedPairs.BINANCE}`,
            'COINBASE': `https://api.coinbase.com/v2/prices/${formattedPairs.COINBASE}/spot`,
            'MEXC': `https://www.mexc.com/open/api/v2/market/ticker?symbol=${formattedPairs.MEXC}`
        };

        const startTime = Date.now(); // Start time for response time calculation

        try {
            const responses = await Promise.all(Object.entries(apiUrls).map(([exchange, url]) => fetchWithLogging(url, exchange)));
            let compiledMessage = '';

            responses.forEach(({ exchange, data, status }) => {
                if (status === 451) {
                    compiledMessage += `\n${exchange}: Failed - Restricted region access.`;
                } else {
                    let priceMessage = '';
                    switch (exchange) {
                        case 'BINANCE':
                            priceMessage = data.symbol ? `${data.symbol} Binance price: ${truncateToFiveDec(data.price)}` : 'Binance: Symbol not found/error fetching price.';
                            break;
                        case 'COINBASE':
                            priceMessage = data.data ? `${data.data.base}-${data.data.currency} Coinbase price: ${truncateToFiveDec(data.data.amount)}` : 'Coinbase: Symbol not found/error fetching price.';
                            break;
                        case 'MEXC':
                            priceMessage = (data.data && data.data.length > 0) ? `${data.data[0].symbol} MEXC price: ${truncateToFiveDec(data.data[0].last)}` : 'MEXC: Symbol not found/error fetching price.';
                            break;
                    }
                    compiledMessage += `\n${priceMessage}`;
                }
            });

            await interaction.deferReply();
            await interaction.editReply(compiledMessage);

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Log successful command usage
            await commandUsageModel.logCommandUsage({
                userID: interaction.user.id,
                commandID: interaction.commandId,
                commandName: interaction.commandName,
                description: 'Fetches the current price of a specified cryptocurrency from multiple exchanges.',
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
            if (error.message.includes('451')) {
                await interaction.followUp('Failed: Restricted region access');
            } else {
                await interaction.followUp('There was an error fetching the cryptocurrency prices.');
            }

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Log failed command usage
            await commandUsageModel.logCommandUsage({
                userID: interaction.user.id,
                commandID: interaction.commandId,
                commandName: interaction.commandName,
                description: 'Fetches the current price of a specified cryptocurrency from multiple exchanges.',
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
