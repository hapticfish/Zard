const { pool } = require('./index');

const userModel = {

    async updateLastBotInteraction(userId) {
        const query = `
        UPDATE user_profiles
        SET last_bot_interaction = CURRENT_TIMESTAMP
        WHERE user_id = $1;
    `;
        try {
            await pool.query(query, [userId]);
        } catch (error) {
            console.error('Failed to update last bot interaction:', error);
            throw error;
        }
    },

    /**
     * Inserts or updates a user profile in the database.
     * @param {Interaction} interaction - The interaction object containing user and guild information.
     * @param {Object} userData - Data provided by the user through modals.
     */
    async upsertUserProfile(interaction, userData) {
        const query = `
        INSERT INTO user_profiles (
            user_id, username, time_zone, email, registration_date, last_bot_interaction,
            preferred_language, investment_profile, risk_tolerance, mobile_number,
            account_type, favorite_cryptocurrencies, user_guild_roles, 
            guild_nickname, user_guild_permissions, guild_join_date
        ) VALUES ($1, $2, $3, $4, CURRENT_DATE, CURRENT_TIMESTAMP, $5, $6, $7, $8, 'free', $9, $10, $11, $12, $13)
        ON CONFLICT (user_id) DO UPDATE SET
            username = EXCLUDED.username,
            time_zone = EXCLUDED.time_zone,
            email = EXCLUDED.email,
            last_bot_interaction = CURRENT_TIMESTAMP,
            preferred_language = EXCLUDED.preferred_language,
            investment_profile = EXCLUDED.investment_profile,
            risk_tolerance = EXCLUDED.risk_tolerance,
            mobile_number = EXCLUDED.mobile_number,
            account_type = EXCLUDED.account_type,
            favorite_cryptocurrencies = EXCLUDED.favorite_cryptocurrencies,
            user_guild_roles = EXCLUDED.user_guild_roles,
            guild_nickname = EXCLUDED.guild_nickname,
            user_guild_permissions = EXCLUDED.user_guild_permissions,
            guild_join_date = EXCLUDED.guild_join_date;
    `;

        const params = [
            interaction.user.id,
            `${interaction.user.username}#${interaction.user.discriminator}`,
            userData.timeZone,
            userData.email,
            interaction.locale,
            userData.investmentProfile,
            userData.riskTolerance,
            userData.mobileNumber,
            userData.favoriteCryptocurrencies ||  null,
            interaction.member.roles.cache.map(role => role.name).join(', '),
            interaction.member.nickname,
            interaction.member.permissions.bitfield.toString(),
            interaction.member.joinedAt.toISOString().split('T')[0]  // Convert Date to YYYY-MM-DD format
        ];

        console.log('Executing query with params:', params); // Debug log

        try {
            await pool.query(query, params);
            console.log('User profile upserted successfully.');
        } catch (error) {
            console.error('Failed to upsert user profile:', error);
            throw error; // Re-throw to allow calling function to handle the error
        }
    }
}



module.exports = userModel;