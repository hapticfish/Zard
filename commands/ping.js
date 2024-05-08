// commands/ping.js
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        // Log the command and user details
        console.log(`Slash command received: /${interaction.commandName} by ${interaction.user.tag}`);

        // Reply to the interaction
        await interaction.reply('Pong!');
        console.log('Replied with Pong!');
    }
};
