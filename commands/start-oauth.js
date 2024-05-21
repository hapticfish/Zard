const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const redditAuth = require('../services/reddit/redditAuth');
const PORT = 3000; // Port for the OAuth listener
const axios = require('axios');
const qs = require('querystring');
const commandUsageModel = require("../database/commandUsageModel");
const {updateLastBotInteraction} = require("../database/databaseUtil");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start-oauth')
        .setDescription('Starts the OAuth process for Reddit integration.')
        .setDefaultMemberPermissions(0), // Sets to zero to make the command admin-only

    async execute(interaction) {
        await updateLastBotInteraction(interaction.user.id);
        // Ensure only the admin can run this command
        if (interaction.user.id !== process.env.ADMIN_DISCORD_ID) {
            return interaction.reply({ content: 'You do not have permission to execute this command.', ephemeral: true });
        }

        // Check if environment variables are set
        if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET) {
            console.error('\nReddit client ID or secret is not set.\n');



            return interaction.reply({ content: 'The bot is not properly configured with Reddit client credentials.', ephemeral: true });
        }

        // Start the OAuth listener if not already running
        if (!redditAuth.listening) {
            try {
                redditAuth.listen(PORT, () => {
                    console.log(`\nOAuth Listener started on port ${PORT}\n`);
                });
            } catch (error) {
                console.error('\nError starting the OAuth listener:\n', error);
                return interaction.reply({ content: 'Failed to start the OAuth listener due to an error.', ephemeral: true });
            }
        }

        // Generate and send the authorization URL
        const url = `https://www.reddit.com/api/v1/authorize?client_id=${process.env.REDDIT_CLIENT_ID}&response_type=code&state=randomstate123&redirect_uri=http://localhost:${PORT}/reddit_callback&duration=permanent&scope=read submit edit identity`;
        const embed = new EmbedBuilder()
            .setTitle('Reddit Authorization')
            .setDescription(`Please click [here](${url}) to authorize the application.`)
            .setColor(0x0099FF);

        await interaction.reply({ embeds: [embed], ephemeral: true });

        // Since Slash Commands do not support listening for messages like prefix commands,
        // You may need to instruct the admin to manually send the authorization code in a secure way or handle it through a different channel.
    }
};
