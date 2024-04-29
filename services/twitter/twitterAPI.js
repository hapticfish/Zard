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
        const tweets = await roClient.v2.search(query, { 'tweet.fields': 'created_at,lang' });
        return tweets.data;
    } catch (error) {
        console.error('Failed to fetch tweets:', error);
        return [];
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
