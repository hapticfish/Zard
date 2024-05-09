const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
require('dotenv').config();

const commands = [
    new SlashCommandBuilder()
        .setName('alert')
        .setDescription('Set an alert for a cryptocurrency pair.')
        .addStringOption(option =>
            option.setName('cryptopair')
                .setDescription('The cryptocurrency pair (e.g., BTCUSD)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('direction')
                .setDescription('Alert when price goes above or below a target.')
                .setRequired(true)
                .addChoices(
                    { name: 'Above', value: 'above' },
                    { name: 'Below', value: 'below' }
                ))
        .addNumberOption(option =>
            option.setName('targetprice')
                .setDescription('Target price to trigger the alert.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('alerttype')
                .setDescription('Type of alert to set.')
                .setRequired(true)
                .addChoices(
                    { name: 'Standard', value: 'standard' },
                    { name: 'Perpetual', value: 'perpetual' }
                )),
    new SlashCommandBuilder()
        .setName('block-time')
        .setDescription('Shows average completion times for most recent blocks by currency.')
        .addStringOption(option =>
            option.setName('ticker')
                .setDescription('The ticker symbol of the cryptocurrency')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('convert')
        .setDescription('Convert amount of provided currency from one to another.')
        .addNumberOption(option =>
            option.setName('amount')
                .setDescription('Amount to convert')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('from_currency')
                .setDescription('Currency to convert from')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('to_currency')
                .setDescription('Currency to convert to')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('delete-alert')
        .setDescription('Deletes one or more alerts by their IDs.')
        .addStringOption(option =>
            option.setName('alert_ids')
                .setDescription('Enter the alert ID(s) to delete, separated by commas')
                .setRequired(true)),
    new SlashCommandBuilder().setName('delete-all-alerts').setDescription('Deletes all or your active alerts.'),
    new SlashCommandBuilder()
        .setName('fee')
        .setDescription('Fetches current transaction fees for a specified cryptocurrency.')
        .addStringOption(option =>
            option.setName('currency')
                .setDescription('The currency to fetch fees for')
                .setRequired(true)
                .addChoices('Bitcoin', 'BTC')),
    new SlashCommandBuilder()
        .setName('feedback')
        .setDescription('Submit a feedback form.'),
    new SlashCommandBuilder()
        .setName('help')  // Change the name to 'help' as per your description
        .setDescription('Displays a list of all available commands.'),
    new SlashCommandBuilder()
        .setName('market-times')
        .setDescription('Displays major market open and close times in your local time.')
        .addStringOption(option =>
            option.setName('timezone')
                .setDescription('Your time zone (e.g., America/New_York)')
                .setRequired(false)),
    new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
    new SlashCommandBuilder().setName('price').setDescription('Show current price for provided cryptocurrency from 3 exchanges.')
        .addStringOption(option =>
            option.setName('symbol')
                .setDescription('The ticker symbol of the cryptocurrency')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('report-bug')
        .setDescription('Submit a bug report to the development team'),
    new SlashCommandBuilder().setName('show-alerts').setDescription('Show a list of all your active alerts.'),
    new SlashCommandBuilder()
        .setName('start-oauth')
        .setDescription('Starts the OAuth process (Admin only)')
        .setDefaultMemberPermissions(0), // This effectively removes the command from view for anyone who isn't an admin
    new SlashCommandBuilder()
        .setName('senti')
        .setDescription('Returns live market sentiment analysis results.')
        .addStringOption(option =>
            option.setName('timeframe')
                .setDescription('The timeframe for sentiment analysis')
                .setRequired(false)
                .addChoices(
                    { name: 'Live', value: 'live' },
                    { name: 'Past Day', value: 'day' },
                    { name: 'Past Week', value: 'week' },
                    { name: 'Past 3 Weeks', value: '3weeks' },
                    { name: 'Past Month', value: 'month' },
                    { name: 'Past 4 Months', value: '4months' },
                    { name: 'Past Year', value: 'year' }
                )),

]
    .map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application-wide (/) commands.');

        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application-wide (/) commands.');
    } catch (error) {
        console.error('Failed to reload commands:', error);
    }
})();
