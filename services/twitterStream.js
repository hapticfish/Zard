const Twit = require('twit');
require('dotenv').config();

const twitterClient = new Twit({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

function startTwitterStream(discordClient) {
    const stream = twitterClient.stream('statuses/filter', {follow: '[NebraskangoonerTwitterUserID]' });

    stream.on('tweet', tweet => {
        if (tweet.user.screen_name.toLowerCase() === 'nebraskangooner' && (tweet.text.toLowerCase().includes('short') || tweet.text.toLowerCase().includes('long') || tweet.text.toLowerCase().includes('bullish') || tweet.text.toLowerCase().includes('bearish'))) {
            const messageToSend = `New tweet from @${tweet.user.screen_name}: ${tweet.text}`;
            const discordChannelID = '[YourDiscordChannelID]';
            discordClient.channels.fetch(discordChannelID)
                .then(channel => channel.send(messageToSend))
                .catch(err => console.error(err));
        }
    });

    console.log('Twitter stream started.');
}

module.exports = { startTwitterStream };