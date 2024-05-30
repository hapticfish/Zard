// metaDataModel.js

const { metadataPool } = require('./index');

let redditMetadataBuffer = [];
let twitterMetadataBuffer = [];
let discordMetadataBuffer = [];
const bufferLimit = 100;

async function bufferAndWriteMetadata(buffer, queryText, queryParamsBuilder) {
    if (buffer.length >= bufferLimit) {
        const client = await metadataPool.connect();
        try {
            await client.query('BEGIN');
            for (const item of buffer) {
                const queryParams = queryParamsBuilder(item);
                await client.query(queryText, queryParams);
            }
            await client.query('COMMIT');
            buffer.length = 0; // Clear buffer after commit
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Failed to write metadata to DB:', error);
        } finally {
            client.release();
        }
    }
}

async function bw_RedditMetadata(data) {
    redditMetadataBuffer.push(...data);
    const queryText = `
        INSERT INTO raw_data (
            source_id, url, num_comments, platform_creation_time, status
        ) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (source_id) DO UPDATE SET
            url = EXCLUDED.url,
            num_comments = EXCLUDED.num_comments,
            platform_creation_time = EXCLUDED.platform_creation_time,
            status = EXCLUDED.status;
    `;
    const queryParamsBuilder = item => [
        item.id, item.url, item.num_comments, item.created, 'partial'
    ];
    await bufferAndWriteMetadata(redditMetadataBuffer, queryText, queryParamsBuilder);
}

async function bw_TwitterMetadata(data) {
    twitterMetadataBuffer.push(...data);
    const queryText = `
        INSERT INTO raw_data (
            source_id, source, content, post_score, num_comments, url, engagment_metrics, author_id, platform_creation_time, system_capture_time, language, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (source_id) DO UPDATE SET
            source = EXCLUDED.source,
            content = EXCLUDED.content,
            post_score = EXCLUDED.post_score,
            num_comments = EXCLUDED.num_comments,
            url = EXCLUDED.url,
            engagment_metrics = EXCLUDED.engagment_metrics,
            author_id = EXCLUDED.author_id,
            platform_creation_time = EXCLUDED.platform_creation_time,
            system_capture_time = EXCLUDED.system_capture_time,
            language = EXCLUDED.language,
            status = EXCLUDED.status;
    `;
    const queryParamsBuilder = item => [
        item.source_id, item.source, item.content, item.post_score, item.num_comments, item.url, item.engagment_metrics, item.author_id, item.platform_creation_time, item.system_capture_time, item.language, 'partial'
    ];
    await bufferAndWriteMetadata(twitterMetadataBuffer, queryText, queryParamsBuilder);
}

async function bw_DiscordMetadata(data) {
    discordMetadataBuffer.push(...data);
    const queryText = `
        INSERT INTO raw_data (
            source_id, source, content, author_id, platform_creation_time, system_capture_time, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (source_id) DO UPDATE SET
            source = EXCLUDED.source,
            content = EXCLUDED.content,
            author_id = EXCLUDED.author_id,
            platform_creation_time = EXCLUDED.platform_creation_time,
            system_capture_time = EXCLUDED.system_capture_time,
            status = EXCLUDED.status;
    `;
    const queryParamsBuilder = item => [
        item.source_id, item.source, item.content, item.author_id, item.platform_creation_time, item.system_capture_time, 'partial'
    ];
    await bufferAndWriteMetadata(discordMetadataBuffer, queryText, queryParamsBuilder);
}

module.exports = { bw_RedditMetadata, bw_TwitterMetadata, bw_DiscordMetadata };
