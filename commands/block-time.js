const { SlashCommandBuilder } = require('@discordjs/builders');
const { loadFetch } = require('../utils/fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('block-time')
        .setDescription('Shows average completion times for most recent blocks by currency.')
        .addStringOption(option =>
            option.setName('ticker')
                .setDescription('The ticker symbol of the cryptocurrency')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();  // Defer the reply to have more than 3 seconds to respond
        const ticker = interaction.options.getString('ticker').toUpperCase();
        console.log(`[START] Execute function triggered for block-time with ticker: ${ticker}.`);

        try {
            const fetch = await loadFetch();
            const baseUrl = 'https://blockchain.info/blocks/';
            const format = '?format=json';
            const url = `${baseUrl}${Date.now()}${format}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blocks = await response.json();
            console.log('Blocks Data:', blocks);

            if (blocks.length >= 10) {
                const last10Blocks = blocks.slice(0, 10);
                let totalCompletionTime = 0;

                for (let i = 0; i < last10Blocks.length - 1; i++) {
                    totalCompletionTime += last10Blocks[i].time - last10Blocks[i + 1].time;
                }

                const averageCompletionTimeInSeconds = totalCompletionTime / (last10Blocks.length - 1);
                const averageMinutes = Math.floor(averageCompletionTimeInSeconds / 60);
                const averageSeconds = averageCompletionTimeInSeconds % 60;

                let responseMessage = `Average Completion Time for the last 10 blocks of ${ticker}: ${averageMinutes} minutes and ${averageSeconds.toFixed(0)} seconds.\n\n`;

                responseMessage += `Completion Times for the Last 3 Blocks of ${ticker}:\n`;
                for (let i = 0; i < 3; i++) {
                    const completionTimeInSeconds = last10Blocks[i].time - last10Blocks[i + 1].time;
                    const minutes = Math.floor(completionTimeInSeconds / 60);
                    const seconds = completionTimeInSeconds % 60;
                    responseMessage += `Block ${last10Blocks[i].height} to Block ${last10Blocks[i + 1].height}: ${minutes} minutes and ${seconds.toFixed(0)} seconds\n`;
                }
                await interaction.editReply(responseMessage);
            } else {
                console.log('Not enough blocks to calculate an average completion time.');
                await interaction.editReply('Not enough blocks to calculate an average completion time or completion times for the last 3 blocks.');
            }
        } catch (error) {
            console.error('Error fetching block times:', error);
            await interaction.editReply('There was an error fetching the block times.');
        }
    }
};