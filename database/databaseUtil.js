const { metadataPool } = require('./index');
const { pool } = require('./index');

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

/**
 * Checks if a user profile exists in the database.
 * @param {string} userId - The user ID to check in the database.
 * @returns {Promise<boolean>} - True if the user profile exists, false otherwise.
 */
async function checkUserProfileExists(userId) {
    const query = `
        SELECT 1
        FROM user_profiles
        WHERE user_id = $1;
    `;
    try {
        const result = await pool.query(query, [userId]);
        return result.rowCount > 0;
    } catch (error) {
        console.error(`Error checking user profile existence for user_id ${userId}:`, error);
        throw error; // Optionally re-throw to handle elsewhere
    }
}

/**
 * Fetches the user's timezone from the database.
 * @param {string} userId - The user ID to fetch the timezone for.
 * @returns {Promise<string|null>} - The user's timezone or null if not found.
 */
async function getUserTimezone(userId) {
    const query = `
        SELECT time_zone
        FROM user_profiles
        WHERE user_id = $1;
    `;
    try {
        const result = await pool.query(query, [userId]);
        if (result.rows.length > 0) {
            return result.rows[0].time_zone;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching timezone for user_id ${userId}:`, error);
        throw error;
    }
}


module.exports = { getUserTimezone, bufferAndWriteMetadata, checkUserProfileExists};
