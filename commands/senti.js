const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const commandUsageModel = require("../database/commandUsageModel");
const {updateLastBotInteraction} = require("../database/databaseUtil");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('senti')
        .setDescription('returns live market sentiment analysis data.')
        .addStringOption(option =>
            option.setName('timeframe')
                .setDescription('The timeframe for sentiment analysis')
                .setRequired(false)
                .addChoices(
                    { name: 'Live', value: 'live' },
                    { name: 'Past Day', value: 'day' },
                    { name: 'Past Week', value: 'week' },
                    { name: 'Past 3 Weeks', value: '3weeks' },
                    { name: 'Past Month', value: 'month' },
                    { name: 'Past 4 Months', value: '4months' },
                    { name: 'Past Year', value: 'year' }
                )),
    async execute(interaction) {
        await updateLastBotInteraction(interaction.user.id);
        const timeframe = interaction.options.getString('timeframe') || 'live';


        const startTime = Date.now(); // Start time for response time calculation
        // Call to the backend service to retrieve sentiment data
        try {
            const sentimentData = await fetchSentimentData(timeframe); // You need to define this function
            const embed = new MessageEmbed()
                .setTitle(`Sentiment Analysis - ${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}`)
                .setDescription(`Sentiment Results: ${sentimentData}`)
                .setColor(0x0099FF);

            await interaction.user.send({ embeds: [embed] });

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Log successful command usage
            await commandUsageModel.logCommandUsage({
                userID: interaction.user.id,
                commandID: interaction.commandId,
                commandName: interaction.commandName,
                description: 'returns live market sentiment analysis data.',
                timestamp: new Date(),
                guildID: interaction.guildId,
                channelID: interaction.channelId,
                parameters: JSON.stringify(interaction.options.data),
                success: true,
                errorCode: null,
                responseTime: responseTime
            });

        } catch (error) {
            console.error('Error fetching sentiment data:', error);
            await interaction.reply({ content: 'Failed to fetch sentiment data. Please try again later.', ephemeral: true });

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Log failed command usage
            await commandUsageModel.logCommandUsage({
                userID: interaction.user.id,
                commandID: interaction.commandId,
                commandName: interaction.commandName,
                description: 'returns live market sentiment analysis data.',
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

async function fetchSentimentData(timeframe) {
    // This function should handle the API call to your Python backend
    // Example: Use fetch or axios to call your Python backend API
    const response = await axios.get(`http://your-backend-url/sentiment?timeframe=${timeframe}`);
    if (response.status !== 200) throw new Error('Failed to retrieve data');
    return response.data; // Assume the response is directly usable
}
