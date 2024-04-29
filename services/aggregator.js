// aggregator.js
const { fetchPosts: fetchRedditPosts } = require('./reddit/redditAPI');
const { fetchPosts: fetchTwitterPosts } = require('./twitter/twitterAPI');
const { send, connectProducer } = require('./kafka/kafkaProducer');
const { bufferAndWriteMetadata } = require('../database/databaseUtil'); // Adjusted path

connectProducer().catch(console.error);

async function fetchData() {
    const subredditName = "CryptoMarkets";
    const keywords = ['Bitcoin', 'btc', 'Crypto'];
    const redditQuery = keywords.join(' OR ');

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
            bufferAndWriteMetadata(metaData);
        }

        // Twitter functionality
        const twitterOptions = {
            // Define similar options for Twitter if applicable
        };
        const twitterPosts = await fetchTwitterPosts('someTwitterParameters', twitterOptions);
        if (twitterPosts.length > 0) {
            await send({ topic: 'twitterPosts', messages: twitterPosts.map(post => JSON.stringify(post)) });
        }
    } catch (error) {
        console.error('Failed to fetch or send data:', error);
    }
}

setInterval(fetchData, 60000); // Fetch data every minute
