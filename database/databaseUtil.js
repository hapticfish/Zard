const { metadataPool } = require('./index');

let metadataBuffer = [];
const bufferLimit = 100;

async function bufferAndWriteMetadata(data) {
    metadataBuffer.push(...data);
    if (metadataBuffer.length >= bufferLimit) {
        const client = await metadataPool.connect();
        try {
            await client.query('BEGIN');
            for (const item of metadataBuffer) {
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
                const queryParams = [
                    item.source_id, item.url, item.num_comments, item.platform_creation_time, 'partial'
                ];
                await client.query(queryText, queryParams);
            }
            await client.query('COMMIT');
            metadataBuffer = []; // Clear buffer after commit
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Failed to write metadata to DB:', error);
        } finally {
            client.release();
        }
    }
}

module.exports = { bufferAndWriteMetadata };
