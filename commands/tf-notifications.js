const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const tfnotificationsModel = require('../database/tfnotificationsModel');
const {updateLastBotInteraction} = require("../database/databaseUtil");
const {logCommandUsage} = require("../database/commandUsageModel"); // Updated path to the database model

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tf-Notifications')
        .setDescription('Enable or disable notifications for specific candle timeframes and market events')
        .addSubcommand(subcommand =>
            subcommand
                .setName('1h')
                .setDescription('1 Hour notifications')
                .addStringOption(option => option.setName('action').setDescription('Enable or disable').setRequired(true).addChoice('enable', 'enable').addChoice('disable', 'disable'))
                .addStringOption(option =>
                    option.setName('First Warning')
                        .setDescription('Warnings in time')
                        .setRequired(false)
                        .addChoices(
                            { name: '5 minutes', value: '5m' },
                            { name: '10 minutes', value: '10m' },
                            { name: '15 minutes', value: '15m' },
                            { name: '30 minutes', value: '30m' },
                            { name: '45 minutes', value: '45m' },
                            { name: '1 hour', value: '1h' },
                            { name: '2 hours', value: '2h' },
                            { name: '4 hours', value: '4h' },
                            { name: '12 hours', value: '12h' },
                            { name: '1 day', value: '1d' },
                            { name: '1 week', value: '1w' }
                        )
                ).addStringOption(option =>
                option.setName('Second Warning')
                    .setDescription('Warnings in time')
                    .setRequired(false)
                    .addChoices(
                        { name: '5 minutes', value: '5m' },
                        { name: '10 minutes', value: '10m' },
                        { name: '15 minutes', value: '15m' },
                        { name: '30 minutes', value: '30m' },
                        { name: '45 minutes', value: '45m' },
                        { name: '1 hour', value: '1h' },
                        { name: '2 hours', value: '2h' },
                        { name: '4 hours', value: '4h' },
                        { name: '12 hours', value: '12h' },
                        { name: '1 day', value: '1d' },
                        { name: '1 week', value: '1w' }
                    )
            ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('4h')
                .setDescription('4 Hour notifications')
                .addStringOption(option => option.setName('action').setDescription('Enable or disable').setRequired(true).addChoice('enable', 'enable').addChoice('disable', 'disable'))
                .addStringOption(option =>
                    option.setName('First Warning')
                        .setDescription('Warnings in time')
                        .setRequired(false)
                        .addChoices(
                            { name: '5 minutes', value: '5m' },
                            { name: '10 minutes', value: '10m' },
                            { name: '15 minutes', value: '15m' },
                            { name: '30 minutes', value: '30m' },
                            { name: '45 minutes', value: '45m' },
                            { name: '1 hour', value: '1h' },
                            { name: '2 hours', value: '2h' },
                            { name: '4 hours', value: '4h' },
                            { name: '12 hours', value: '12h' },
                            { name: '1 day', value: '1d' },
                            { name: '1 week', value: '1w' }
                        )
                ).addStringOption(option =>
                option.setName('Second Warning')
                    .setDescription('Warnings in time')
                    .setRequired(false)
                    .addChoices(
                        { name: '5 minutes', value: '5m' },
                        { name: '10 minutes', value: '10m' },
                        { name: '15 minutes', value: '15m' },
                        { name: '30 minutes', value: '30m' },
                        { name: '45 minutes', value: '45m' },
                        { name: '1 hour', value: '1h' },
                        { name: '2 hours', value: '2h' },
                        { name: '4 hours', value: '4h' },
                        { name: '12 hours', value: '12h' },
                        { name: '1 day', value: '1d' },
                        { name: '1 week', value: '1w' }
                    )
            ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('daily')
                .setDescription('Daily notifications')
                .addStringOption(option => option.setName('action').setDescription('Enable or disable').setRequired(true).addChoice('enable', 'enable').addChoice('disable', 'disable'))
                .addStringOption(option =>
                    option.setName('First Warning')
                        .setDescription('Warnings in time')
                        .setRequired(false)
                        .addChoices(
                            { name: '5 minutes', value: '5m' },
                            { name: '10 minutes', value: '10m' },
                            { name: '15 minutes', value: '15m' },
                            { name: '30 minutes', value: '30m' },
                            { name: '45 minutes', value: '45m' },
                            { name: '1 hour', value: '1h' },
                            { name: '2 hours', value: '2h' },
                            { name: '4 hours', value: '4h' },
                            { name: '12 hours', value: '12h' },
                            { name: '1 day', value: '1d' },
                            { name: '1 week', value: '1w' }
                        )
                ).addStringOption(option =>
                option.setName('Second Warning')
                    .setDescription('Warnings in time')
                    .setRequired(false)
                    .addChoices(
                        { name: '5 minutes', value: '5m' },
                        { name: '10 minutes', value: '10m' },
                        { name: '15 minutes', value: '15m' },
                        { name: '30 minutes', value: '30m' },
                        { name: '45 minutes', value: '45m' },
                        { name: '1 hour', value: '1h' },
                        { name: '2 hours', value: '2h' },
                        { name: '4 hours', value: '4h' },
                        { name: '12 hours', value: '12h' },
                        { name: '1 day', value: '1d' },
                        { name: '1 week', value: '1w' }
                    )
            ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('weekly')
                .setDescription('Weekly notifications')
                .addStringOption(option => option.setName('action').setDescription('Enable or disable').setRequired(true).addChoice('enable', 'enable').addChoice('disable', 'disable'))
                .addStringOption(option =>
                    option.setName('First Warning')
                        .setDescription('Warnings in time')
                        .setRequired(false)
                        .addChoices(
                            { name: '5 minutes', value: '5m' },
                            { name: '10 minutes', value: '10m' },
                            { name: '15 minutes', value: '15m' },
                            { name: '30 minutes', value: '30m' },
                            { name: '45 minutes', value: '45m' },
                            { name: '1 hour', value: '1h' },
                            { name: '2 hours', value: '2h' },
                            { name: '4 hours', value: '4h' },
                            { name: '12 hours', value: '12h' },
                            { name: '1 day', value: '1d' },
                            { name: '1 week', value: '1w' }
                        )
                ).addStringOption(option =>
                option.setName('Second Warning')
                    .setDescription('Warnings in time')
                    .setRequired(false)
                    .addChoices(
                        { name: '5 minutes', value: '5m' },
                        { name: '10 minutes', value: '10m' },
                        { name: '15 minutes', value: '15m' },
                        { name: '30 minutes', value: '30m' },
                        { name: '45 minutes', value: '45m' },
                        { name: '1 hour', value: '1h' },
                        { name: '2 hours', value: '2h' },
                        { name: '4 hours', value: '4h' },
                        { name: '12 hours', value: '12h' },
                        { name: '1 day', value: '1d' },
                        { name: '1 week', value: '1w' }
                    )
            ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('monthly')
                .setDescription('Monthly notifications')
                .addStringOption(option => option.setName('action').setDescription('Enable or disable').setRequired(true).addChoice('enable', 'enable').addChoice('disable', 'disable'))
                .addStringOption(option =>
                    option.setName('First Warning')
                        .setDescription('Warnings in time')
                        .setRequired(false)
                        .addChoices(
                            { name: '5 minutes', value: '5m' },
                            { name: '10 minutes', value: '10m' },
                            { name: '15 minutes', value: '15m' },
                            { name: '30 minutes', value: '30m' },
                            { name: '45 minutes', value: '45m' },
                            { name: '1 hour', value: '1h' },
                            { name: '2 hours', value: '2h' },
                            { name: '4 hours', value: '4h' },
                            { name: '12 hours', value: '12h' },
                            { name: '1 day', value: '1d' },
                            { name: '1 week', value: '1w' }
                        )
                ).addStringOption(option =>
                option.setName('Second Warning')
                    .setDescription('Warnings in time')
                    .setRequired(false)
                    .addChoices(
                        { name: '5 minutes', value: '5m' },
                        { name: '10 minutes', value: '10m' },
                        { name: '15 minutes', value: '15m' },
                        { name: '30 minutes', value: '30m' },
                        { name: '45 minutes', value: '45m' },
                        { name: '1 hour', value: '1h' },
                        { name: '2 hours', value: '2h' },
                        { name: '4 hours', value: '4h' },
                        { name: '12 hours', value: '12h' },
                        { name: '1 day', value: '1d' },
                        { name: '1 week', value: '1w' }
                    )
            ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('quarterly')
                .setDescription('Quarterly notifications')
                .addStringOption(option => option.setName('action').setDescription('Enable or disable').setRequired(true).addChoice('enable', 'enable').addChoice('disable', 'disable'))
                .addStringOption(option =>
                    option.setName('First Warning')
                        .setDescription('Warnings in time')
                        .setRequired(false)
                        .addChoices(
                            { name: '5 minutes', value: '5m' },
                            { name: '10 minutes', value: '10m' },
                            { name: '15 minutes', value: '15m' },
                            { name: '30 minutes', value: '30m' },
                            { name: '45 minutes', value: '45m' },
                            { name: '1 hour', value: '1h' },
                            { name: '2 hours', value: '2h' },
                            { name: '4 hours', value: '4h' },
                            { name: '12 hours', value: '12h' },
                            { name: '1 day', value: '1d' },
                            { name: '1 week', value: '1w' }
                        )
                ).addStringOption(option =>
                option.setName('Second Warning')
                    .setDescription('Warnings in time')
                    .setRequired(false)
                    .addChoices(
                        { name: '5 minutes', value: '5m' },
                        { name: '10 minutes', value: '10m' },
                        { name: '15 minutes', value: '15m' },
                        { name: '30 minutes', value: '30m' },
                        { name: '45 minutes', value: '45m' },
                        { name: '1 hour', value: '1h' },
                        { name: '2 hours', value: '2h' },
                        { name: '4 hours', value: '4h' },
                        { name: '12 hours', value: '12h' },
                        { name: '1 day', value: '1d' },
                        { name: '1 week', value: '1w' }
                    )
            ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('cme-open')
                .setDescription('CME Open notifications')
                .addStringOption(option => option.setName('action').setDescription('Enable or disable').setRequired(true).addChoice('enable', 'enable').addChoice('disable', 'disable'))
                .addStringOption(option =>
                    option.setName('First Warning')
                        .setDescription('Warnings in time')
                        .setRequired(false)
                        .addChoices(
                            { name: '5 minutes', value: '5m' },
                            { name: '10 minutes', value: '10m' },
                            { name: '15 minutes', value: '15m' },
                            { name: '30 minutes', value: '30m' },
                            { name: '45 minutes', value: '45m' },
                            { name: '1 hour', value: '1h' },
                            { name: '2 hours', value: '2h' },
                            { name: '4 hours', value: '4h' },
                            { name: '12 hours', value: '12h' },
                            { name: '1 day', value: '1d' },
                            { name: '1 week', value: '1w' }
                        )
                ).addStringOption(option =>
                option.setName('Second Warning')
                    .setDescription('Warnings in time')
                    .setRequired(false)
                    .addChoices(
                        { name: '5 minutes', value: '5m' },
                        { name: '10 minutes', value: '10m' },
                        { name: '15 minutes', value: '15m' },
                        { name: '30 minutes', value: '30m' },
                        { name: '45 minutes', value: '45m' },
                        { name: '1 hour', value: '1h' },
                        { name: '2 hours', value: '2h' },
                        { name: '4 hours', value: '4h' },
                        { name: '12 hours', value: '12h' },
                        { name: '1 day', value: '1d' },
                        { name: '1 week', value: '1w' }
                    )
            ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('cme-close')
                .setDescription('CME Close notifications')
                .addStringOption(option => option.setName('action').setDescription('Enable or disable').setRequired(true).addChoice('enable', 'enable').addChoice('disable', 'disable'))
                .addStringOption(option =>
                    option.setName('First Warning')
                        .setDescription('Warnings in time')
                        .setRequired(false)
                        .addChoices(
                            { name: '5 minutes', value: '5m' },
                            { name: '10 minutes', value: '10m' },
                            { name: '15 minutes', value: '15m' },
                            { name: '30 minutes', value: '30m' },
                            { name: '45 minutes', value: '45m' },
                            { name: '1 hour', value: '1h' },
                            { name: '2 hours', value: '2h' },
                            { name: '4 hours', value: '4h' },
                            { name: '12 hours', value: '12h' },
                            { name: '1 day', value: '1d' },
                            { name: '1 week', value: '1w' }
                        )
                ).addStringOption(option =>
                option.setName('Second Warning')
                    .setDescription('Warnings in time')
                    .setRequired(false)
                    .addChoices(
                        { name: '5 minutes', value: '5m' },
                        { name: '10 minutes', value: '10m' },
                        { name: '15 minutes', value: '15m' },
                        { name: '30 minutes', value: '30m' },
                        { name: '45 minutes', value: '45m' },
                        { name: '1 hour', value: '1h' },
                        { name: '2 hours', value: '2h' },
                        { name: '4 hours', value: '4h' },
                        { name: '12 hours', value: '12h' },
                        { name: '1 day', value: '1d' },
                        { name: '1 week', value: '1w' }
                    )
            ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('market_open')
                .setDescription('Market Open notifications')
                .addStringOption(option => option.setName('action').setDescription('Enable or disable').setRequired(true).addChoice('enable', 'enable').addChoice('disable', 'disable'))
                .addStringOption(option =>
                    option.setName('First Warning')
                        .setDescription('Warnings in time')
                        .setRequired(false)
                        .addChoices(
                            { name: '5 minutes', value: '5m' },
                            { name: '10 minutes', value: '10m' },
                            { name: '15 minutes', value: '15m' },
                            { name: '30 minutes', value: '30m' },
                            { name: '45 minutes', value: '45m' },
                            { name: '1 hour', value: '1h' },
                            { name: '2 hours', value: '2h' },
                            { name: '4 hours', value: '4h' },
                            { name: '12 hours', value: '12h' },
                            { name: '1 day', value: '1d' },
                            { name: '1 week', value: '1w' }
                        )
                )
                .addStringOption(option =>
                    option.setName('Second Warning')
                        .setDescription('Warnings in time')
                        .setRequired(false)
                        .addChoices(
                            { name: '5 minutes', value: '5m' },
                            { name: '10 minutes', value: '10m' },
                            { name: '15 minutes', value: '15m' },
                            { name: '30 minutes', value: '30m' },
                            { name: '45 minutes', value: '45m' },
                            { name: '1 hour', value: '1h' },
                            { name: '2 hours', value: '2h' },
                            { name: '4 hours', value: '4h' },
                            { name: '12 hours', value: '12h' },
                            { name: '1 day', value: '1d' },
                            { name: '1 week', value: '1w' }
                        )
                )),
    async execute(interaction) {
        console.log(interaction); // Log the entire interaction object
        console.log(interaction.options); // Log all the options received

        const startTime = Date.now();

        try{
            await updateLastBotInteraction(interaction.user.id);

            const action = interaction.options.getString('action');
            const firstWarning = interaction.options.getString('first_warning');
            const secondWarning = interaction.options.getString('second_warning');
            const event = interaction.options.getSubcommand();
            const userId = interaction.user.id;

            /// Update or insert notification settings in the database
            if (action === 'enable') {
                await tfnotificationsModel.upsertTFNotification(userId, event, true, firstWarning, secondWarning);
                await interaction.reply({ content: `Enabled ${event} notifications with warnings at ${firstWarning} and ${secondWarning}`, ephemeral: true });
            } else if (action === 'disable') {
                await tfnotificationsModel.upsertTFNotification(userId, event, false, null, null);
                await interaction.reply({ content: `Disabled ${event} notifications`, ephemeral: true });
            } else {
                await interaction.reply({ content: 'Invalid action', ephemeral: true });
            }

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Log successful command usage
            await logCommandUsage({
                userID: interaction.user.id,
                commandID: interaction.commandId, // You might need to define or derive this
                commandName: interaction.commandName,
                description: 'Enable or disable notifications for specific candle timeframes and market events',
                timestamp: new Date(),
                guildID: interaction.guildId,
                channelID: interaction.channelId,
                parameters: JSON.stringify(interaction.options.data), // Assuming interaction.options.data contains command parameters
                success: true,
                errorCode: null,
                responseTime: responseTime
            });

        }catch (error) {
            console.error('Error handling the interaction:', error);
            await interaction.reply({ content: 'There was an error processing your request. Please try again later.', ephemeral: true });

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Log successful command usage
            await logCommandUsage({
                userID: interaction.user.id,
                commandID: interaction.commandId, // You might need to define or derive this
                commandName: interaction.commandName,
                description: 'Enable or disable notifications for specific candle timeframes and market events',
                timestamp: new Date(),
                guildID: interaction.guildId,
                channelID: interaction.channelId,
                parameters: JSON.stringify(interaction.options.data), // Assuming interaction.options.data contains command parameters
                success: false,
                errorCode: error.message,
                responseTime: responseTime
            });

        }
    },
};