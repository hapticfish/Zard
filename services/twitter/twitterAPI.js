// twitterAPI.js
const { TwitterApi } = require('twitter-api-v2');

const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const roClient = twitterClient.readOnly;

exports.fetchTweets = async (query) => {
    try {
        const tweets = await roClient.v2.search(query, { 'tweet.fields': 'id,created_at,text,lang,public_metrics,author_id' });
        return tweets.data.map(tweet => ({
            source_id: tweet.id,
            source: 'Twitter/X',
            content: tweet.text,
            title: null,
            keywords: null,
            post_score: tweet.public_metrics.favorite_count,
            num_comments: tweet.public_metrics.reply_count,
            url: `https://twitter.com/i/web/status/${tweet.id}`,
            engagment_metrics: tweet.public_metrics.retweet_count,
            author_id: tweet.author_id,
            platform_creation_time: tweet.created_at,
            system_capture_time: new Date().toISOString(),
            batch_ids: null, // You need to populate this with actual batch ID when processing
            language: tweet.lang
        }));
    } catch (error) {
        console.error('Failed to fetch tweets:', error);
        return [];
    }
};

exports.postTweet = async (status) => {
    try {
        return await twitterClient.v2.tweet(status);
    } catch (error) {
        console.error('Failed to post tweet:', error);
        throw error;
    }
};

exports.deleteTweet = async (tweetId) => {
    try {
        await twitterClient.v2.deleteTweet(tweetId);
        console.log(`Tweet with ID ${tweetId} deleted successfully.`);
    } catch (error) {
        console.error('Failed to delete tweet:', error);
        throw error;
    }
};

exports.getUserDetails = async () => {
    try {
        return await roClient.v2.me();
    } catch (error) {
        console.error('Failed to fetch user details:', error);
        throw error;
    }
};

// twitterStream.js
const { fetchTweets } = require('./twitterAPI');
const { sendToKafka } = require('../kafka/kafkaProducer');

exports.startStream = async (query) => {
    const stream = await fetchTweets(query);
    stream.on('data', (tweet) => {
        // Send each tweet to Kafka
        sendToKafka('twitter-topic', tweet);
    });
};
