const { metadataPool } = require('./index'); // Use the existing pool from index.js

async function insertRedditData(data) {
    const client = await metadataPool.connect();
    try {
        await client.query('BEGIN');
        const query = 'INSERT INTO reddit_data(id, url, num_comments, created) VALUES($1, $2, $3, $4)';
        for (let item of data) {
            await client.query(query, [item.id, item.url, item.num_comments, item.create]);
        }
        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Failed to insert Reddit data:', e);
    } finally {
        client.release();
    }
}


module.exports = { insertRedditData };
 //todo finish integrating reditModel properly
//todo ensure that separate pools work and have the right URL
//todo integrated with aggregator
//todo make sure that its not writing without the other recored from python
//todo make sure databaseUtil is correct.