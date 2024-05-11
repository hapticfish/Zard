const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const reportingModel = require('../database/reportingModel');
const { checkUserProfileExists } = require('../database/databaseUtil'); // Adjust the path as necessary based on your project structure

module.exports = {
    data: new SlashCommandBuilder()
        .setName('feedback')
        .setDescription('Submit feedback form.'),

    async execute(interaction) {
        // First, check if the user is registered before showing the modal
        const userExists = await checkUserProfileExists(interaction.user.id);
        if (!userExists) {
            await interaction.reply({ content: 'Please register your profile before submitting feedback.', ephemeral: true });
            return; // Stop the execution if the user is not registered
        }

        const modal = new ModalBuilder()
            .setCustomId('userFeedbackModal')
            .setTitle('User Feedback Form');

        // Create text input fields
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
    },

    async modalSubmit(modalInteraction) {
        if (modalInteraction.customId !== 'userFeedbackModal') return;

        const userID = modalInteraction.user.id;
        const feedbackType = modalInteraction.fields.getTextInputValue('feedbackTypeInput');
        const content = modalInteraction.fields.getTextInputValue('contentInput');
        const satRating = parseInt(modalInteraction.fields.getTextInputValue('satRatingInput'), 10);
        const responseNeeded = modalInteraction.fields.getTextInputValue('responseNeededInput') === 'Yes';

        // Call the reporting model to write data to the database
        try {
            await reportingModel.writeUserFeedback(userID, feedbackType, satRating, content, responseNeeded, modalInteraction);
            await modalInteraction.reply({ content: 'Thank you for your feedback!', ephemeral: true });
        } catch (error) {
            console.error('Error handling feedback submission:', error);
            await modalInteraction.reply({ content: 'Failed to submit your feedback.', ephemeral: true });
        }
    }
};
