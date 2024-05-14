const { logCommandUsage } = require('../database/commandUsageModel');

async function logUsage(interaction, success, errorCode, startTime) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    await logCommandUsage({
        userID: interaction.user.id,
        commandID: interaction.commandId,
        commandName: interaction.commandName,
        description: interaction.command.description,
        timestamp: new Date(),
        guildID: interaction.guildId,
        channelID: interaction.channelId,
        parameters: JSON.stringify(interaction.fields.fields),
        success: success,
        errorCode: errorCode,
        responseTime: responseTime
    });
}

module.exports = { logUsage };
