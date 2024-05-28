const moment = require('moment-timezone');
const { Client, GatewayIntentBits } = require('discord.js');
const rewire = require('rewire');
const notificationScheduler = require('../schedulers/notificationScheduler');

// Mock database model
const tfnotificationsModel = {
    async getEnabledNotifications() {
        return [
            {
                user_id: '211232814702657536',
                event_type: '1h',
                enabled: true,
                warning_1: '15m',
                warning_2: '5m',
                user_time_zone: 'UTC'
            },
            {
                user_id: '211232814702657536',
                event_type: '4h',
                enabled: true,
                warning_1: '30m',
                warning_2: '15m',
                user_time_zone: 'UTC'
            },
            {
                user_id: '211232814702657536',
                event_type: 'daily',
                enabled: true,
                warning_1: '12h',
                warning_2: '4h',
                user_time_zone: 'UTC'
            },
            {
                user_id: '211232814702657536',
                event_type: 'weekly',
                enabled: true,
                warning_1: '1d',
                warning_2: '12h',
                user_time_zone: 'UTC'
            },
            {
                user_id: '211232814702657536',
                event_type: 'monthly',
                enabled: true,
                warning_1: '1w',
                warning_2: '1d',
                user_time_zone: 'UTC'
            },
            {
                user_id: '211232814702657536',
                event_type: 'quarterly',
                enabled: true,
                warning_1: '1w',
                warning_2: '1d',
                user_time_zone: 'UTC'
            },
            {
                user_id: '211232814702657536',
                event_type: 'cme_open',
                enabled: true,
                warning_1: '30m',
                warning_2: '15m',
                user_time_zone: 'UTC'
            },
            {
                user_id: '211232814702657536',
                event_type: 'cme_close',
                enabled: true,
                warning_1: '30m',
                warning_2: '15m',
                user_time_zone: 'UTC'
            },
            {
                user_id: '211232814702657536',
                event_type: 'market_open',
                enabled: true,
                warning_1: '1h',
                warning_2: '30m',
                user_time_zone: 'UTC'
            }
        ];
    }
};

// Override the original model with the mock
notificationScheduler.__set__('db', tfnotificationsModel);

// Initialize the Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Mock sendNotification function for testing
function sendNotification(client, userId, message) {
    console.log(`Mock notification to user ${userId}: ${message}`);
}

// Override the sendNotification function in the scheduler
notificationScheduler.__set__('sendNotification', sendNotification);

client.once('ready', async () => {
    console.log('Ready for testing!');
    notificationScheduler.init(client);

    // Simulate different times to trigger notifications
    const simulateTimes = [
        moment.utc().startOf('hour').add(1, 'hour').subtract(15, 'minutes'), // 1h first warning
        moment.utc().startOf('hour').add(1, 'hour').subtract(5, 'minutes'),  // 1h second warning
        moment.utc().startOf('hour').add(4, 'hours').subtract(30, 'minutes'), // 4h first warning
        moment.utc().startOf('hour').add(4, 'hours').subtract(15, 'minutes'), // 4h second warning
        moment.utc().startOf('day').add(1, 'day').subtract(12, 'hours'), // daily first warning
        moment.utc().startOf('day').add(1, 'day').subtract(4, 'hours'), // daily second warning
        moment.utc().startOf('isoWeek').add(1, 'week').subtract(1, 'day'), // weekly first warning
        moment.utc().startOf('isoWeek').add(1, 'week').subtract(12, 'hours'), // weekly second warning
        moment.utc().startOf('month').add(1, 'month').subtract(1, 'week'), // monthly first warning
        moment.utc().startOf('month').add(1, 'month').subtract(1, 'day'), // monthly second warning
        moment.utc().startOf('quarter').add(1, 'quarter').subtract(1, 'week'), // quarterly first warning
        moment.utc().startOf('quarter').add(1, 'quarter').subtract(1, 'day'), // quarterly second warning
        moment.utc().day(0).hour(21).minute(30), // cme_open first warning
        moment.utc().day(0).hour(21).minute(45), // cme_open second warning
        moment.utc().day(5).hour(21).minute(30), // cme_close first warning
        moment.utc().day(5).hour(21).minute(45), // cme_close second warning
        moment.utc().hour(8).minute(30), // market_open first warning
        moment.utc().hour(9).minute(0) // market_open second warning
    ];

    simulateTimes.forEach(simulatedTime => {
        console.log(`Simulating time: ${simulatedTime.format()}`);
        notificationScheduler.checkNotifications(simulatedTime, client);
    });
});

client.login(process.env.DISCORD_TOKEN);
