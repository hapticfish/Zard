const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { checkUserProfileExists } = require('../database/databaseUtil'); // Adjust the path as necessary based on your project structure

module.exports = {
    data: new SlashCommandBuilder()
        .setName('feedback')
        .setDescription('Submit feedback form.'),

    async execute(interaction) {
        const userExists = await checkUserProfileExists(interaction.user.id);
        if (!userExists) {
            await interaction.reply({ content: 'Please register your profile before submitting feedback.', ephemeral: true });
            return;
        }

        const modal = new ModalBuilder()
            .setCustomId('userFeedbackModal')
            .setTitle('User Feedback Form');

        const feedbackTypeInput = new TextInputBuilder()
            .setCustomId('feedbackTypeInput')
            .setLabel("Feedback Type: complaint, suggestion, etc.")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const contentInput = new TextInputBuilder()
            .setCustomId('contentInput')
            .setLabel("Describe your feedback")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const satRatingInput = new TextInputBuilder()
            .setCustomId('satRatingInput')
            .setLabel("Satisfaction rating (1-10)")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const responseNeededInput = new TextInputBuilder()
            .setCustomId('responseNeededInput')
            .setLabel("Do you need a response?")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(feedbackTypeInput),
            new ActionRowBuilder().addComponents(contentInput),
            new ActionRowBuilder().addComponents(satRatingInput),
            new ActionRowBuilder().addComponents(responseNeededInput)
        );

        await interaction.showModal(modal);
    }
};
