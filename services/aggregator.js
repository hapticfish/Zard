// aggregator.js
const { fetchPosts: fetchRedditPosts } = require('./reddit/redditAPI');
const { fetchTweets } = require('./twitter/twitterAPI');
const { fetchAllMessages, startMessageStream } = require('./discord/discordAPI');
const { send, connectProducer } = require('./kafka/kafkaProducer');
const { bw_RedditMetadata, bw_TwitterMetadata, bw_DiscordMetadata } = require('../database/metaDataModel'); // Adjusted path

connectProducer().catch(console.error);

async function fetchSentimentData(client) {
    const subredditName = "CryptoMarkets";
    const keywords = ['Bitcoin', 'btc', 'Crypto'];
    const redditQuery = keywords.join(' OR ');

    const redditOptions = {
        query: redditQuery,
        sort: 'new',
        time: 'day',
        limit: 10
    };

    //Fetch Reddit posts
    try {
        const redditPosts = await fetchRedditPosts(subredditName, redditOptions);
        const redditSentimentData = redditPosts.map(post => ({
            id: post.id,
            title: post.title,
            content: post.selftext,
            score: post.score
        }));
        const redditMetaData = redditPosts.map(post => ({
            id: post.id,
            url: post.url,
            num_comments: post.num_comments,
            created: post.created
        }));
        if (redditSentimentData.length > 0) {
            await send({ topic: 'redditSentiment', messages: redditSentimentData.map(data => JSON.stringify(data)) });
        }
        if (redditMetaData.length > 0) {
            await bw_RedditMetadata(redditMetaData);
        }

        // Define options for Twitter if applicable
        const twitterOptions = {};
        const twitterPosts = await fetchTweets('Bitcoin OR btc OR Crypto', twitterOptions);
        const twitterSentimentData = twitterPosts.map(post => ({
            id: post.id,
            content: post.text,
            created_at: post.created_at
        }));
        const twitterMetaData = twitterPosts.map(post => ({
            source_id: post.id,
            source: 'Twitter',
            content: post.text,
            post_score: post.public_metrics.favorite_count,
            num_comments: post.public_metrics.reply_count,
            url: `https://twitter.com/i/web/status/${post.id}`,
            engagment_metrics: post.public_metrics.retweet_count,
            author_id: post.author_id,
            platform_creation_time: post.created_at,
            system_capture_time: new Date().toISOString(),
            language: post.lang
        }));
        if (twitterSentimentData.length > 0) {
            await send({ topic: 'twitterSentiment', messages: twitterSentimentData.map(data => JSON.stringify(data)) });
            await bw_TwitterMetadata(twitterMetaData);
        }


        // Fetch Discord messages
        const discordMessages = await fetchAllMessages(client);
        const discordSentimentData = discordMessages.map(message => ({
            id: message.id,
            content: message.content,
            createdTimestamp: message.createdTimestamp
        }));
        const discordMetaData = discordMessages.map(message => ({
            source_id: message.id,
            source: 'Discord',
            content: message.content,
            author_id: message.author.id,
            platform_creation_time: message.createdTimestamp,
            system_capture_time: new Date().toISOString()
        }));
        if (discordSentimentData.length > 0) {
            await send({ topic: 'discordSentiment', messages: discordSentimentData.map(message => JSON.stringify(message)) });
            await bw_DiscordMetadata(discordMetaData);
        }

    } catch (error) {
        console.error('Failed to fetch or send data:', error);
    }
}

function startDataStream(client) {
    setInterval(() => fetchSentimentData(client), 5000); // Fetch data every 5 sec
}

module.exports = { fetchSentimentData, startDataStream};
