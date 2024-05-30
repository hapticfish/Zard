const { pool } = require('./index');

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

/**
 * Updates user's Profile with the last time interacted with Bot command.
 * @param {string} userId - The user ID to fetch the profile to update.
 */
async function updateLastBotInteraction(userId) {
    const query = `
        UPDATE user_profiles
        SET last_bot_interaction = NOW()
        WHERE user_id = $1;
    `;
    try {
        await pool.query(query, [userId]);
        console.log(`Updated last_bot_interaction for user_id ${userId}`);
    } catch (error) {
        console.error(`Error updating last_bot_interaction for user_id ${userId}:`, error);
        throw error;
    }
}


module.exports = { getUserTimezone, bufferAndWriteMetadata, checkUserProfileExists, updateLastBotInteraction };
