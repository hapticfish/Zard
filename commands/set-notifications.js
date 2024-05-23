const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_notifications')
        .setDescription('Enable or disable notifications for specific timeframes and market events')
        .addSubcommand(subcommand =>
            subcommand
                .setName('1h')
                .setDescription('1 Hour notifications')
                .addStringOption(option => option.setName('action').setDescription('Enable or disable').setRequired(true).addChoice('enable', 'enable').addChoice('disable', 'disable'))
                .addStringOption(option => option.setName('notifications').setDescription('notifications in time (e.g., 10m 30m)').setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('4h')
                .setDescription('4 Hour notifications')
                .addStringOption(option => option.setName('action').setDescription('Enable or disable').setRequired(true).addChoice('enable', 'enable').addChoice('disable', 'disable'))
                .addStringOption(option => option.setName('notifications').setDescription('notifications in time (e.g., 30m 1h)').setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('daily')
                .setDescription('Daily notifications')
                .addStringOption(option => option.setName('action').setDescription('Enable or disable').setRequired(true).addChoice('enable', 'enable').addChoice('disable', 'disable'))
                .addStringOption(option => option.setName('notifications').setDescription('notifications in time (e.g., 1h 2h)').setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('weekly')
                .setDescription('Weekly notifications')
                .addStringOption(option => option.setName('action').setDescription('Enable or disable').setRequired(true).addChoice('enable', 'enable').addChoice('disable', 'disable'))
                .addStringOption(option => option.setName('notifications').setDescription('notifications in time (e.g., 12h 4h 1h)').setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('monthly')
                .setDescription('Monthly notifications')
                .addStringOption(option => option.setName('action').setDescription('Enable or disable').setRequired(true).addChoice('enable', 'enable').addChoice('disable', 'disable'))
                .addStringOption(option => option.setName('notifications').setDescription('notifications in time (e.g., 1w 1d 12h 4h 2h 1h)').setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('quarterly')
                .setDescription('Quarterly notifications')
                .addStringOption(option => option.setName('action').setDescription('Enable or disable').setRequired(true).addChoice('enable', 'enable').addChoice('disable', 'disable'))
                .addStringOption(option => option.setName('notifications').setDescription('notifications in time (e.g., 1w 1d 12h 4h 2h 1h)').setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('cme_open')
                .setDescription('CME Open notifications')
                .addStringOption(option => option.setName('action').setDescription('Enable or disable').setRequired(true).addChoice('enable', 'enable').addChoice('disable', 'disable'))
                .addStringOption(option => option.setName('notifications').setDescription('notifications in time (e.g., 15m 30m)').setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('cme_close')
                .setDescription('CME Close notifications')
                .addStringOption(option => option.setName('action').setDescription('Enable or disable').setRequired(true).addChoice('enable', 'enable').addChoice('disable', 'disable'))
                .addStringOption(option => option.setName('notifications').setDescription('notifications in time (e.g., 15m 30m)').setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('market_open')
                .setDescription('Market Open notifications')
                .addStringOption(option => option.setName('action').setDescription('Enable or disable').setRequired(true).addChoice('enable', 'enable').addChoice('disable', 'disable'))),
    async execute(interaction) {
        const action = interaction.options.getString('action');
        const warnings = interaction.options.getString('warnings');
        const subcommand = interaction.options.getSubcommand();

        if (action === 'enable') {
            // Enable notifications
            // Store the settings in the database or your preferred storage
            await interaction.reply(`Enabled ${subcommand} notifications with warnings at ${warnings}`);
        } else if (action === 'disable') {
            // Disable notifications
            // Remove the settings from the database or your preferred storage
            await interaction.reply(`Disabled ${subcommand} notifications`);
        } else {
            await interaction.reply('Invalid action');
        }
    },
};
//todo Add command logging , add 'bot interactin logging' implament back end functionality, create database table an
//todo and research relevent feilds and columbs, 