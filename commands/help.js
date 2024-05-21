const { SlashCommandBuilder } = require('@discordjs/builders');
const commandUsageModel = require("../database/commandUsageModel");
const {updateLastBotInteraction} = require("../database/databaseUtil");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays a detailed list of all available commands and their usage examples.'),
    async execute(interaction) {
        await updateLastBotInteraction(interaction.user.id);


        const commandsMenu = `
Hello! Here's a detailed list of commands you can use with examples:

1. **/price [crypto_symbol]** - Retrieves the current price of a specified cryptocurrency (e.g., /price BTC).
2. **/market-times [timezone]** - Displays the opening and closing times of major cryptocurrency markets in your specified timezone (e.g., /market-times EST).
3. **/convert [amount] [from_currency] [to_currency]** - Converts a specified amount from one cryptocurrency to another (e.g., /convert 100 BTC ETH).
4. **/alert [cryptopair] [direction] [targetprice] [alerttype]** - Sets a price alert based on direction ('above' or 'below') for a cryptocurrency pair at a target price (e.g., /alert BTCUSD above 30000 perpetual).
5. **/fee [currency]** - Shows the current transaction fees for a specified cryptocurrency (e.g., /fee ETH).
6. **/block-time [ticker]** - Displays the average block completion times for a specified cryptocurrency (e.g., /block-time BTC).
7. **/delete-alert [alert_ids]** - Deletes one or more specified alerts by their IDs (e.g., /delete-alert 12345).
8. **/delete-all-alerts** - Deletes all of your active price alerts.
9. **/feedback** - Allows you to submit a feedback form to provide suggestions or report issues.
10. **/ping** - Tests the responsiveness of the bot (replies with "Pong!").
11. **/senti [timeframe]** - Returns live market sentiment analysis for a specified timeframe, which helps in understanding market trends (e.g., /senti 24h).
12. **/start-oauth** - Initiates the OAuth authentication process, necessary for linking personal cryptocurrency accounts (Admin only).
13. **/report-bug** - Allows you to report a bug to the development team with details of the issue.
14. **/show-alerts** - Displays a list of all your active price alerts.

What can I help you with today?
        `;

        const startTime = Date.now(); // Start time for response time calculation
        try {
            // Send a DM to the user with the commands menu, or send it in the channel if DMs are not available
            await interaction.user.send(commandsMenu);
            await interaction.reply({ content: 'I\'ve sent you a DM with all available commands! 📬', ephemeral: true });

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Log successful command usage
            await commandUsageModel.logCommandUsage({
                userID: interaction.user.id,
                commandID: interaction.commandId,
                commandName: interaction.commandName,
                description: 'Displays a detailed list of all available commands and their usage examples.\'),\n' +
                    '    async execute(interaction) {',
                timestamp: new Date(),
                guildID: interaction.guildId,
                channelID: interaction.channelId,
                parameters: JSON.stringify(interaction.options.data),
                success: true,
                errorCode: null,
                responseTime: responseTime
            });

        } catch (error) {
            // If there's an error sending the DM, possibly due to DMs being closed, send the message in the channel
            await interaction.reply({ content: commandsMenu, ephemeral: true });

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Log successful command usage
            await commandUsageModel.logCommandUsage({
                userID: interaction.user.id,
                commandID: interaction.commandId,
                commandName: interaction.commandName,
                description: 'Displays a detailed list of all available commands and their usage examples.\'),\n' +
                    '    async execute(interaction) {',
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
