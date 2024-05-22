// commands/ping.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const commandUsageModel = require("../database/commandUsageModel");
const {updateLastBotInteraction} = require("../database/databaseUtil");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        await updateLastBotInteraction(interaction.user.id);

        const startTime = Date.now(); // Start time for response time calculation

        try{
            console.log(`Slash command received: /${interaction.commandName} by ${interaction.user.tag}`);
            await interaction.reply({content: 'Pong!', ephemeral: true });
            console.log('Replied with Pong!');

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Log successful command usage
            await commandUsageModel.logCommandUsage({
                userID: interaction.user.id,
                commandID: interaction.commandId,
                commandName: interaction.commandName,
                description: 'Replies with Pong!',
                timestamp: new Date(),
                guildID: interaction.guildId,
                channelID: interaction.channelId,
                parameters: JSON.stringify(interaction.options.data),
                success: true,
                errorCode: null,
                responseTime: responseTime
            });

        }catch (error){
            console.error('Error running Ping command:', error);
            await interaction.reply({content: 'Ping failed. Somethings wrong here...', ephemeral: true });

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Log failed command usage
            await commandUsageModel.logCommandUsage({
                userID: interaction.user.id,
                commandID: interaction.commandId,
                commandName: interaction.commandName,
                description: 'Replies with Pong!',
                timestamp: new Date(),
                guildID: interaction.guildId,
                channelID: interaction.channelId,
                parameters: JSON.stringify(interaction.options.data),
                success: false,
                errorCode: error.message,
                responseTime: responseTime
            });
        }
    }
};
