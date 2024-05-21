const { SlashCommandBuilder } = require('@discordjs/builders');
const puppeteer = require('puppeteer');
const commandUsageModel = require("../database/commandUsageModel");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fee')
        .setDescription('Fetches current transaction fees for a specified cryptocurrency.')
        .addStringOption(option =>
            option.setName('currency')
                .setDescription('The currency to fetch fees for')
                .setRequired(true)
                .addChoices({ name: 'Bitcoin (BTC)', value: 'BTC' })),
    async execute(interaction) {
        await interaction.deferReply();  // Defers the reply, acknowledging the interaction.
        const currency = interaction.options.getString('currency');

        // Ensure the currency is BTC
        if (currency !== 'BTC') {
            await interaction.editReply('This command currently only supports Bitcoin (BTC).');
            return;
        }

        const startTime = Date.now(); // Start time for response time calculation
        try {
            const fees = await scrapeFees();
            const feeMessage = `Current Transaction Fees for Bitcoin Processed in:\n- Next Block: ${fees.nextBlock}\n- 3 Blocks: ${fees.threeBlocks}\n- 6 Blocks: ${fees.sixBlocks}`;
            await interaction.editReply(feeMessage);

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Log successful command usage
            await commandUsageModel.logCommandUsage({
                userID: interaction.user.id,
                commandID: interaction.commandId,
                commandName: interaction.commandName,
                description: 'Fetches current transaction fees for a specified cryptocurrency.',
                timestamp: new Date(),
                guildID: interaction.guildId,
                channelID: interaction.channelId,
                parameters: JSON.stringify(interaction.options.data),
                success: true,
                errorCode: null,
                responseTime: responseTime
            });

        } catch (error) {
            console.error('Error fetching the transaction fees:', error);
            await interaction.editReply('There was an error fetching the transaction fees.');

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Log failed command usage
            await commandUsageModel.logCommandUsage({
                userID: interaction.user.id,
                commandID: interaction.commandId,
                commandName: interaction.commandName,
                description: 'Fetches current transaction fees for a specified cryptocurrency.',
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


async function scrapeFees() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://privacypros.io/tools/bitcoin-fee-estimator/', { waitUntil: 'networkidle0' });

    const fees = await page.evaluate(() => {
        return {
            nextBlock: '$' + document.querySelector('#nbf-td > span').innerText,
            threeBlocks: '$' + document.querySelector('#tbf-td > span').innerText,
            sixBlocks: '$' + document.querySelector('#sbf-td > span').innerText,
        };
    });

    await browser.close();
    return fees;
}
