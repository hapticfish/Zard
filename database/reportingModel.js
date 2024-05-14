const { pool } = require('./index');

const reportingModel = {
    async writeBugReport(userID, title, description, steps, severity, interaction) {
        console.log(`Bug Report received from ${userID}: Title - ${title}, Severity - ${severity}`);

        const client = await pool.connect();

        try {
            // Start a transaction
            await client.query('BEGIN');

            // Check if the user exists in the user_profiles table
            const userExistsQuery = `SELECT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = $1)`;
            const userExistsResult = await client.query(userExistsQuery, [userID]);

            if (!userExistsResult.rows[0].exists) {
                console.log(`No user profile found for user_id: ${userID}`);
                await interaction.reply({ content: 'No user profile found. Please register your profile before submitting bug reports.', ephemeral: true });
                await client.query('ROLLBACK'); // Rollback transaction
                return;
            }

            // Insert the bug report into the database
            const query = `
                INSERT INTO bug_reports (user_id, title, description, steps_to_reproduce, severity)
                VALUES ($1, $2, $3, $4, $5)
            `;
            const values = [userID, title, description, steps, severity];
            await client.query(query, values);
            console.log('Bug report submitted successfully');
            await interaction.editReply({ content: 'Bug report submitted successfully!', ephemeral: true });

            await client.query('COMMIT'); // Commit transaction
        } catch (dbError) {
            console.error('Database insertion error:', dbError);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Failed to submit your bug report.', ephemeral: true });
            } else {
                await interaction.editReply({ content: 'Failed to submit your bug report.', ephemeral: true });
            }
            await client.query('ROLLBACK'); // Rollback transaction
        } finally {
            client.release();
        }
    },

    async writeUserFeedback(userID, feedbackType, satRating, content, responseNeeded, interaction) {
        console.log(`User Feedback received ${userID} ${feedbackType} ${satRating} ${content} ${responseNeeded}`);

        const client = await pool.connect();

        try {
            // Start a transaction
            await client.query('BEGIN');

            // Check if the user exists in the user_profiles table
            const userExistsQuery = `SELECT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = $1)`;
            const userExistsResult = await client.query(userExistsQuery, [userID]);

            if (!userExistsResult.rows[0].exists) {
                console.log(`No user profile found for user_id: ${userID}`);
                await interaction.reply({ content: 'No user profile found. Please create a profile before submitting feedback.', ephemeral: true });
                await client.query('ROLLBACK'); // Rollback transaction
                return;
            }

            // Insert the feedback into the database
            const query = `
                INSERT INTO user_feedback (user_id, feedback_type, satisfaction_rating, content, response_needed)
                VALUES ($1, $2, $3, $4, $5)
            `;
            const values = [userID, feedbackType, satRating, content, responseNeeded];
            await client.query(query, values);
            console.log('Feedback submitted successfully');
            await interaction.editReply({ content: 'User feedback submitted successfully!', ephemeral: true });

            await client.query('COMMIT'); // Commit transaction
        } catch (dbError) {
            console.error('Database insertion error:', dbError);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Failed to submit user feedback.', ephemeral: true });
            } else {
                await interaction.editReply({ content: 'Failed to submit user feedback.', ephemeral: true });
            }
            await client.query('ROLLBACK'); // Rollback transaction
        } finally {
            client.release();
        }
    }
};

module.exports = reportingModel;
