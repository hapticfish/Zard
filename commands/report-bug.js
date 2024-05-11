const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const reportingModel = require('../database/reportingModel');
const { checkUserProfileExists } = require('../database/databaseUtil'); // Ensure correct path based on your project structure

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report-bug')
        .setDescription('Report a bug you\'ve encountered.'),

    async execute(interaction) {
        // First, check if the user is registered before showing the modal
        const userExists = await checkUserProfileExists(interaction.user.id);
        if (!userExists) {
            await interaction.reply({ content: 'Please register your profile before submitting bug reports.', ephemeral: true });
            return; // Stop the execution if the user is not registered
        }

        const modal = new ModalBuilder()
            .setCustomId('bugReportModal')
            .setTitle('Bug Report Form');

        // Create text input fields
        const titleInput = new TextInputBuilder()
            .setCustomId('titleInput')
            .setLabel("What's the bug title?")
            .setStyle(TextInputStyle.Short);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('descriptionInput')
            .setLabel("Describe the bug")
            .setStyle(TextInputStyle.Paragraph);

        const stepsInput = new TextInputBuilder()
            .setCustomId('stepsInput')
            .setLabel("Steps to reproduce")
            .setStyle(TextInputStyle.Paragraph);

        const severityInput = new TextInputBuilder()
            .setCustomId('severityInput')
            .setLabel("Severity of the bug")
            .setStyle(TextInputStyle.Short);

        // Add inputs to modal using ActionRowBuilder
        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(descriptionInput),
            new ActionRowBuilder().addComponents(stepsInput),
            new ActionRowBuilder().addComponents(severityInput)
        );

        // Show the modal to the user
        await interaction.showModal(modal);
    },

    async modalSubmit(modalInteraction) {
        if (modalInteraction.customId !== 'bugReportModal') return;

        const userID = modalInteraction.user.id;
        const title = modalInteraction.fields.getTextInputValue('titleInput');
        const description = modalInteraction.fields.getTextInputValue('descriptionInput');
        const steps = modalInteraction.fields.getTextInputValue('stepsInput');
        const severity = modalInteraction.fields.getTextInputValue('severityInput');

        // Call the reporting model to write data to the database
        try {
            await reportingModel.writeBugReport(userID, title, description, steps, severity, modalInteraction);
            await modalInteraction.reply({ content: 'Bug report submitted successfully!', ephemeral: true });
        } catch (error) {
            console.error('Error handling bug report submission:', error);
            await modalInteraction.reply({ content: 'Failed to submit your bug report.', ephemeral: true });
        }
    }
};
