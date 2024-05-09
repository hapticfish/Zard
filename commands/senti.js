const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('senti')
        .setDescription('Returns live market sentiment analysis results.')
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
        const timeframe = interaction.options.getString('timeframe') || 'live';

        // Call to the backend service to retrieve sentiment data
        try {
            const sentimentData = await fetchSentimentData(timeframe); // You need to define this function
            const embed = new MessageEmbed()
                .setTitle(`Sentiment Analysis - ${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}`)
                .setDescription(`Sentiment Results: ${sentimentData}`)
                .setColor(0x0099FF);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching sentiment data:', error);
            await interaction.reply({ content: 'Failed to fetch sentiment data. Please try again later.', ephemeral: true });
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
