require('dotenv').config();
const { fetchTweets, postTweet, deleteTweet, getUserDetails } = require('../services/twitter/twitterAPI');

async function testTwitterAPI() {
    try {
        console.log('Testing Twitter API endpoints...');

        // Fetch tweets based on a query
        console.log('Fetching tweets...');
        const tweets = await fetchTweets('Bitcoin OR btc OR Crypto');
        console.log('Fetched Tweets:', tweets);

        // Post a tweet
        console.log('Posting a tweet...');
        const newTweet = await postTweet('This is a test tweet from our bot!');
        console.log('Posted Tweet:', newTweet);

        // Delete a tweet by ID
        console.log('Deleting the tweet...');
        await deleteTweet(newTweet.data.id);
        console.log('Deleted Tweet with ID:', newTweet.data.id);

        // Get user details
        console.log('Fetching user details...');
        const user = await getUserDetails();
        console.log('User Details:', user);
    } catch (error) {
        console.error('Error performing Twitter operations:', error);
    }
}

testTwitterAPI().then(() => {
    console.log('Twitter API tests completed successfully.');
}).catch(error => {
    console.error('Error in Twitter API tests:', error);
});
