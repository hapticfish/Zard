const redditAuth = require('../services/reddit/redditAuth');
const PORT = 3000; // Port for the OAuth listener
const axios = require('axios');
const qs = require('querystring');
const { EmbedBuilder } = require('discord.js');


module.exports = {
    name: 'startoauth',
    execute(message, args) {
        if (message.author.id !== process.env.ADMIN_DISCORD_ID) { // Ensure only the admin can run this command
            return message.reply('You do not have permission to execute this command.');
        }

        // Check if environment variables are set
        if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET) {
            console.error('\nReddit client ID or secret is not set.\n');
            return message.reply('The bot is not properly configured with Reddit client credentials.');
        }

        // Start the OAuth listener if not already running
        if (!redditAuth.listening) {
            try {
                redditAuth.listen(PORT, () => {
                    console.log(`\nOAuth Listener started on port ${PORT}\n`);
                });
            } catch (error) {
                console.error('\nError starting the OAuth listener:\n', error);
                return message.reply('\nFailed to start the OAuth listener due to an error.\n');
            }
        }

        // Generate and send the authorization URL
        const url = `https://www.reddit.com/api/v1/authorize?client_id=4p2Y7tgChOwMMgUHI62IiA&response_type=code&state=blipblipbluefin5656843&redirect_uri=http://localhost:${PORT}/reddit_callback&duration=permanent&scope=identity%20edit%20flair%20history%20modconfig%20modflair%20modlog%20modposts%20modwiki%20mysubreddits%20privatemessages%20read%20report%20save%20submit%20subscribe%20vote%20wikiread`;
        const embed = new EmbedBuilder()
            .setTitle('Reddit Authorization')
            .setDescription(`Please click [here](${url}) to authorize the application.`)
            .setColor(0x0099FF);

        message.channel.send({ embeds: [embed] });

        // Listen for the next message containing the authorization code
        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector({ filter, max: 1, time: 600000 }); // 10 minutes

        collector.on('collect', async m => {
            const code = m.content.trim();
            console.log('\nAttempting to exchange the code for a token...\n');
            try {
                const response = await axios.post('https://www.reddit.com/api/v1/access_token', qs.stringify({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: `http://localhost:${PORT}/reddit_callback`
                }), {
                    auth: {
                        username: process.env.REDDIT_CLIENT_ID,
                        password: process.env.REDDIT_CLIENT_SECRET
                    },
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });

                const { refresh_token } = response.data;
                if (!refresh_token) {
                    console.log('No refresh token in response:', response.data);
                    return m.reply('No refresh token received. Please check authorization and scopes.');
                }
                console.log('\nRefresh Token:\n', refresh_token); // Log or store securely
                m.reply('Refresh token successfully retrieved and stored.');
            } catch (error) {
                console.error('\nError data:\n', error.response ? error.response.data : error.message);
                m.reply('Failed to retrieve the refresh token. Check the logs for more details.');
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                message.channel.send('No code received, operation timed out.');
            }
        });
    }
};
