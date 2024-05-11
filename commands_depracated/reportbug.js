const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, Events } = require('discord.js');
const reportingModel = require('../database/reportingModel');

module.exports = {
    name: 'reportbug',
    async execute(interaction) {
        // Ensure this is a chat input command
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === 'reportbug') {
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

            // Listen for the modal submit event
            interaction.client.on(Events.InteractionCreate, async (modalInteraction) => {
                if (!modalInteraction.isModalSubmit()) return;
                if (modalInteraction.customId === 'bugReportModal') {
                    const userID = modalInteraction.user.id;
                    const title = modalInteraction.fields.getTextInputValue('titleInput');
                    const description = modalInteraction.fields.getTextInputValue('descriptionInput');
                    const steps = modalInteraction.fields.getTextInputValue('stepsInput');
                    const severity = modalInteraction.fields.getTextInputValue('severityInput');

                    // Call the reporting model to write data to the database
                    try {
                        await reportingModel.writeBugReport(userID, title, description, steps, severity);
                        await modalInteraction.reply({ content: 'Bug report submitted successfully!', ephemeral: true });
                    } catch (error) {
                        console.error('Error handling bug report submission:', error);
                        await modalInteraction.reply({ content: 'Failed to submit your bug report.', ephemeral: true });
                    }
                }
            });
        }
    }
};
