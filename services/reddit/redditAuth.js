const express = require('express');
const axios = require("axios");
const qs = require("qs");
const app = express();


const PORT = 3000;
app.get('/reddit_callback', async (req, res) => {
    const {code, state, error} = req.query;

    // Check for errors returned by Reddit
    if (error) {
        console.error(`Reddit returned an error: ${error}`);
        return res.status(400).send(`An error occurred: ${error}`);
    }

    // Ensure the authorization code is present
    if (!code) {
        console.error('No authorization code provided');
        return res.status(400).send("No authorization code provided. Please try again.");
    }

    // Log the authorization code securely (only for debugging; remove or secure this log in production)
    console.log(`Authorization code received: ${code}`);

// Immediately try to exchange the code for a refresh token
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
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });

        const {refresh_token} = response.data;
        if (refresh_token) {
            console.log('Refresh Token:', refresh_token);
            res.send("Refresh token received. You can close this window now.");
            // Optionally: Emit event or notify bot about the new refresh token
        } else {
            console.log('No refresh token in response:', response.data);
            res.status(400).send('Failed to retrieve the refresh token.');
        }
    } catch (error) {
        console.error('Error exchanging code for tokens:', error.response ? error.response.data : error.message);
        res.status(500).send('Error during token exchange.');
    }
});

module.exports = app;