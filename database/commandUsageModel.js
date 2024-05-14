const { pool } = require('./index');

const commandUsageModel = {
    /**
     * Logs command usage into the database.
     * @param {Object} commandData - An object containing details about the command usage.
     * @param {Object} interaction - The interaction object from Discord.
     */
    async logCommandUsage(commandData) {
        console.log(`Command usage logged: UserID - ${commandData.userID}, CommandName - ${commandData.commandName}`);

        let client;
        try {

            client = await pool.connect();
            // Start a transaction
            await client.query('BEGIN');

            // Insert the command usage into the database
            const query = `
                INSERT INTO CommandUsage (
                    UserID, CommandID, CommandName, Description, Timestamp,
                    GuildID, ChannelID, Parameters, Success, ErrorCode, ResponseTime
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `;
            const values = [
                commandData.userID,
                commandData.commandID,
                commandData.commandName,
                commandData.description,
                commandData.timestamp,
                commandData.guildID,
                commandData.channelID,
                commandData.parameters,
                commandData.success,
                commandData.errorCode,
                commandData.responseTime
            ];
            await client.query(query, values);
            console.log('Command usage logged successfully');

            await client.query('COMMIT'); // Commit transaction
        } catch (dbError) {
            console.error('Database insertion error:', dbError);
            await client.query('ROLLBACK'); // Rollback transaction
        } finally {
            client.release();
        }
    }
};

module.exports = commandUsageModel;
