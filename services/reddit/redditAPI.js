// redditAPI.js
const Snoowrap = require('snoowrap');

const r = new Snoowrap({
    userAgent: 'Zard Bot v0.0.1 (by /u/ZardofScales)',
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    refreshToken: process.env.REDDIT_REFRESH_TOKEN,
});

exports.fetchPosts = async (subreddit, options) => {
    try {
        const posts = await r.getSubreddit(subreddit).search({
            query: options.query,
            sort: options.sort || 'new', // Default to 'new' if not specified
            time: options.time || 'day', // Default to 'day'
            limit: options.limit || 10   // Default to 10
        });
        return posts.map(post => ({
            id: post.id,
            title: post.title,
            content: post.selftext,
            created: new Date(post.created_utc * 1000),
            url: post.url,
            score: post.score,
            num_comments: post.num_comments
        }));
    } catch (error) {
        console.error('Failed to fetch Reddit posts:', error);
        return [];
    }
};