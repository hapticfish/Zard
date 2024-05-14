const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { checkUserProfileExists } = require('../database/databaseUtil'); // Ensure correct path based on your project structure

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report-bug')
        .setDescription('Report a bug you\'ve encountered.'),

    async execute(interaction) {
        const userExists = await checkUserProfileExists(interaction.user.id);
        if (!userExists) {
            await interaction.reply({ content: 'Please register your profile before submitting bug reports.', ephemeral: true });
            return;
        }

        const modal = new ModalBuilder()
            .setCustomId('bugReportModal')
            .setTitle('Bug Report Form');

        const titleInput = new TextInputBuilder()
            .setCustomId('titleInput')
            .setLabel("What's the bug title?")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('descriptionInput')
            .setLabel("Describe the bug")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const stepsInput = new TextInputBuilder()
            .setCustomId('stepsInput')
            .setLabel("Steps to reproduce")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const severityInput = new TextInputBuilder()
            .setCustomId('severityInput')
            .setLabel("Severity of the bug")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(descriptionInput),
            new ActionRowBuilder().addComponents(stepsInput),
            new ActionRowBuilder().addComponents(severityInput)
        );

        await interaction.showModal(modal);
    }
};
