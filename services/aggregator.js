// aggregator.js
const { fetchPosts: fetchRedditPosts } = require('./reddit/redditAPI');
const { fetchPosts: fetchTwitterPosts } = require('./twitter/twitterAPI');
const { fetchMessages } = require('./discord/discordAPI');
const { send, connectProducer } = require('./kafka/kafkaProducer');
const { bufferAndWriteMetadata } = require('../database/databaseUtil'); // Adjusted path

connectProducer().catch(console.error);

async function fetchSentimentData(client) {
    const subredditName = "CryptoMarkets";
    const keywords = ['Bitcoin', 'btc', 'Crypto'];
    const redditQuery = keywords.join(' OR ');
    const discordChannelId = 'YOUR_DISCORD_CHANNEL_ID'; // Replace with actual channel ID

    const redditOptions = {
        query: redditQuery,
        sort: 'new',
        time: 'day',
        limit: 10
    };

    try {
        const redditPosts = await fetchRedditPosts(subredditName, redditOptions);
        const sentimentData = redditPosts.map(post => ({
            id: post.id,
            title: post.title,
            content: post.selftext,
            score: post.score
        }));
        const metaData = redditPosts.map(post => ({
            id: post.id,
            url: post.url,
            num_comments: post.num_comments,
            created: post.created
        }));

        if (sentimentData.length > 0) {
            await send({ topic: 'redditSentiment', messages: sentimentData.map(data => JSON.stringify(data)) });
        }
        if (metaData.length > 0) {
            await bufferAndWriteMetadata(metaData);
        }

        // Twitter functionality
        const twitterOptions = {
            // Define similar options for Twitter if applicable
        };
        const twitterPosts = await fetchTwitterPosts('someTwitterParameters', twitterOptions);
        if (twitterPosts.length > 0) {
            await send({ topic: 'twitterPosts', messages: twitterPosts.map(post => JSON.stringify(post)) });
        }

        const discordMessages = await fetchMessages(client, discordChannelId);
        if (discordMessages.length > 0) {
            await send({ topic: 'discordMessages', messages: discordMessages.map(message => JSON.stringify(message)) });
        }

    } catch (error) {
        console.error('Failed to fetch or send data:', error);
    }
}

setInterval(fetchSentimentData, 60000); // Fetch data every minute

module.exports = { fetchSentimentData };
