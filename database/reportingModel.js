const { pool } = require('./index');

const  reportingModel = {


    async writeBugReport(userID, title, description, steps, severity) {
        console.log(`Bug Report received ${userID} ${title} ${description} ${steps} ${severity}`);
        const query = `
            INSERT INTO bug_reports (user_id, title, description, steps_to_reproduce, severity)
            VALUES ($1, $2, $3, $4, $5)
        `;
        const values = [userID, title, description, steps, severity];

        try {
            await pool.query(query, values);
            await interaction.reply({ content: 'Bug report submitted successfully!', ephemeral: true });
        } catch (error) {
            console.error('Database insertion error:', error);
            await interaction.reply({ content: 'Failed to submit your bug report.', ephemeral: true });
        }
    },



    async writeUserFeedback(userID, feedbackType, satRating,content, responseNeeded) {
        console.log(`User Feedback received ${userID} ${feedbackType} ${satRating} ${content} ${responseNeeded} `);
        const query = `
            INSERT INTO user_feedback (user_id, feedbackType, satRating, content, responseNeeded)
            VALUES ($1, $2, $3, $4, $5)
        `;
        const values = [userID, feedbackType, satRating, content, responseNeeded];

        try {
            await pool.query(query, values);
            await interaction.reply({ content: 'User Feedback submitted successfully!', ephemeral: true });
        } catch (error) {
            console.error('Database insertion error:', error);
            await interaction.reply({ content: 'Failed to submit User Feedback.', ephemeral: true });
        }
    },


};

module.exports = reportingModel;