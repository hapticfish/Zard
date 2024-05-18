const { logCommandUsage } = require('../database/commandUsageModel');

async function logUsage(interaction, success, errorCode, startTime, commandInfo) {
    const endTime = Date.now();
    const responseTime = startTime ? endTime - startTime : -1; // Use -1 if startTime is not set

    /*const commandName = interaction.commandName || commandInfo.commandName || 'Unknown';
    const commandId = interaction.commandId || commandInfo.commandId || 'Unknown';*/

    let description;
    switch (commandInfo.commandName) {
        case 'feedback':
            description = 'Submit feedback form.';
            break;
        case 'report-bug':
            description = 'Report a bug you\'ve encountered.';
            break;
        case 'create-profile':
            description = 'Create User Profile.';
            break;
        default:
            description = 'No description available';
            break;
    }

    await logCommandUsage({
        userID: interaction.user.id,
        commandID: commandInfo.commandId || null,
        commandName: commandInfo.commandName || null,
        description: description,
        timestamp: new Date(),
        guildID: interaction.guildId,
        channelID: interaction.channelId,
        parameters: JSON.stringify(interaction.fields.fields),
        success: success,
        errorCode: errorCode,
        responseTime: responseTime !== null ? responseTime : -1  // Default to -1 if responseTime is null
    });
}

module.exports = { logUsage };
