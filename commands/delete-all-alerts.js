const { SlashCommandBuilder } = require('@discordjs/builders');
const AlertModel = require('../database/alertModel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-all-alerts')
        .setDescription('Deletes all alerts set by the user.'),
    async execute(interaction) {
        const userId = interaction.user.id; // This gets the ID of the user who invoked the slash command

        try {
            await AlertModel.deactivateAllAlerts(userId, 'User deactivated all alerts');
            await interaction.reply('All your alerts have been successfully deleted.');
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to delete alerts. Please try again later.', ephemeral: true });
        }
    },
};
