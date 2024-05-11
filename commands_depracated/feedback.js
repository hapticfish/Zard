

module.exports = {
    name: 'feedback',
    async execute(interaction, client) { // Ensure client is passed from the main bot file where this module is required
        // Create the modal
        const modal = new ModalBuilder()
            .setCustomId('userFeedbackModal')
            .setTitle('User Feedback Form');

        // Create input fields for the modal
        const feedbackTypeInput = new TextInputBuilder()
            .setCustomId('feedbackTypeInput')
            .setLabel("Feedback Type: complaint, suggestion ect")
            .setStyle(TextInputStyle.Short);

        const contentInput = new TextInputBuilder()
            .setCustomId('contentInput')
            .setLabel("Your feedback")
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

        // Listen for the modal submit event
        client.on(Events.InteractionCreate, async (interaction) => {
            if (!interaction.isModalSubmit()) return;

            if (interaction.customId === 'userFeedbackModal') {
                const userID = interaction.user.id;
                const feedbackType = interaction.fields.getTextInputValue('feedbackTypeInput');
                const content = interaction.fields.getTextInputValue('contentInput');
                const satRating = parseInt(interaction.fields.getTextInputValue('satRatingInput'));
                const responseNeeded = interaction.fields.getTextInputValue('responseNeededInput') === 'Yes';

                try {
                    await reportingModel.writeUserFeedback(userID, feedbackType, satRating, content, responseNeeded);
                    await interaction.reply({ content: 'Thank you for your feedback!', ephemeral: true });
                } catch (error) {
                    console.error('Error handling feedback submission:', error);
                    await interaction.reply({ content: 'Failed to submit your feedback.', ephemeral: true });
                }
            }
        });
    }
};
