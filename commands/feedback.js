const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const reportingModel = require('../database/reportingModel');
const { checkUserProfileExists } = require('../database/databaseUtil'); // Adjust the path as necessary based on your project structure



module.exports = {
    data: new SlashCommandBuilder()
        .setName('feedback')
        .setDescription('Submit feedback form.'),
    async execute(interaction) {
        // Create the modal
        const modal = new ModalBuilder()
            .setCustomId('userFeedbackModal')
            .setTitle('User Feedback Form');

        // Create input fields for the modal
        const feedbackTypeInput = new TextInputBuilder()
            .setCustomId('feedbackTypeInput')
            .setLabel("Feedback Type: complaint, suggestion, etc.")
            .setStyle(TextInputStyle.Short);

        const contentInput = new TextInputBuilder()
            .setCustomId('contentInput')
            .setLabel("Describe your feedback")
            .setStyle(TextInputStyle.Paragraph);

        const satRatingInput = new TextInputBuilder()
            .setCustomId('satRatingInput')
            .setLabel("Satisfaction rating (1-10)")
            .setStyle(TextInputStyle.Short);

        const responseNeededInput = new TextInputBuilder()
            .setCustomId('responseNeededInput')
            .setLabel("Do you need a response?")
            .setStyle(TextInputStyle.Short);

        // Add inputs to modal using ActionRowBuilder
        modal.addComponents(
            new ActionRowBuilder().addComponents(feedbackTypeInput),
            new ActionRowBuilder().addComponents(contentInput),
            new ActionRowBuilder().addComponents(satRatingInput),
            new ActionRowBuilder().addComponents(responseNeededInput)
        );

        // Show the modal to the user
        await interaction.showModal(modal);

        // Handle modal submission
        interaction.awaitModalSubmit({ time: 60000, filter: i => i.customId === 'userFeedbackModal' })
            .then(async modalInteraction => {
                const feedbackType = modalInteraction.fields.getTextInputValue('feedbackTypeInput');
                const content = modalInteraction.fields.getTextInputValue('contentInput');
                const satRating = parseInt(modalInteraction.fields.getTextInputValue('satRatingInput'), 10);
                const responseNeeded = modalInteraction.fields.getTextInputValue('responseNeededInput') === 'Yes';

                // Here you might check if the user profile exists or not before submitting feedback
                // Assuming `checkUserProfileExists` is a function that checks user profiles
                const userExists = await checkUserProfileExists(modalInteraction.user.id);
                if (!userExists) {
                    await modalInteraction.reply({ content: 'Please create a user profile before submitting feedback.', ephemeral: true });
                    return;
                }


                try {
                    await reportingModel.writeUserFeedback(modalInteraction.user.id, feedbackType, satRating, content, responseNeeded, modalInteraction);
                    await modalInteraction.reply({ content: 'Thank you for your feedback!', ephemeral: true });
                } catch (error) {
                    console.error('Error handling feedback submission:', error);
                    await modalInteraction.reply({ content: 'Failed to submit your feedback.', ephemeral: true });
                }
            })
            .catch(error => {
                console.error('Error or timeout on feedback modal submission:', error);
                interaction.followUp({ content: 'Failed to submit your feedback due to a timeout or error.', ephemeral: true });
            });
    }
};
