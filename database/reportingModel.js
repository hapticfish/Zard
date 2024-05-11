const { pool } = require('./index');

const  reportingModel = {


    async writeBugReport(userID, title, description, steps, severity, interaction) {
        console.log(`Bug Report received from ${userID}: Title - ${title}, Severity - ${severity}`);

        // First, check if the user exists in the user_profiles table
        const userExistsQuery = `SELECT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = $1)`;
        try {
            const userExistsResult = await pool.query(userExistsQuery, [userID]);
            if (!userExistsResult.rows[0].exists) {
                console.log(`No user profile found for user_id: ${userID}`);
                await interaction.reply({ content: 'No user profile found. Please register your profile before submitting bug reports.', ephemeral: true });
                return; // Exit the function if the user does not exist
            }
        } catch (error) {
            console.error('Error checking user existence:', error);
            await interaction.reply({ content: 'Error verifying user profile.', ephemeral: true });
            return;
        }

        // Proceed with inserting the bug report into the database
        const query = `
        INSERT INTO bug_reports (user_id, title, description, steps_to_reproduce, severity)
        VALUES ($1, $2, $3, $4, $5)
    `;
        const values = [userID, title, description, steps, severity];
        try {
            await pool.query(query, values);
            console.log('Bug report submitted successfully');
            await interaction.reply({ content: 'Bug report submitted successfully!', ephemeral: true });
        } catch (dbError) {
            console.error('Database insertion error:', dbError);
            await interaction.reply({ content: 'Failed to submit your bug report.', ephemeral: true });
        }
    },



    async writeUserFeedback(userID, feedbackType, satRating, content, responseNeeded, interaction) {
        console.log(`User Feedback received ${userID} ${feedbackType} ${satRating} ${content} ${responseNeeded}`);

        // Check if the user exists in the user_profiles table
        const userExistsQuery = `SELECT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = $1)`;
        try {
            const userExistsResult = await pool.query(userExistsQuery, [userID]);
            if (!userExistsResult.rows[0].exists) {
                // User does not exist, prompt for registration
                console.log(`No user profile found for user_id: ${userID}`);
                await interaction.reply({ content: 'No user profile found. Please create a profile before submitting feedback.', ephemeral: true });
                return; // Exit the function to prevent further execution
            }
        } catch (error) {
            console.error('Error checking user existence:', error);
            await interaction.reply({ content: 'Error checking user profile.', ephemeral: true });
            return;
        }

        // Proceed with inserting the feedback into the database
        const query = `
        INSERT INTO user_feedback (user_id, feedback_type, satisfaction_rating, content, response_needed)
        VALUES ($1, $2, $3, $4, $5)
    `;
        const values = [userID, feedbackType, satRating, content, responseNeeded];

        try {
            await pool.query(query, values);
            console.log('Feedback submitted successfully');
            await interaction.reply({ content: 'User Feedback submitted successfully!', ephemeral: true });
        } catch (dbError) {
            console.error('Database insertion error:', dbError);
            await interaction.reply({ content: 'Failed to submit User Feedback.', ephemeral: true });
        }
    }





};

module.exports = reportingModel;