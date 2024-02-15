
const moment = require('moment-timezone');

module.exports = {
    name: 'mo',
    // Check for user provided timezone
    execute(message, args) {
        console.log(`Message received: ${message.content}`);
        console.log('!mo command received'); // Confirm command is detected

        const userTimezone = args[0] || 'UTC';

        // Debugging: Log the moment.tz.zone output for the provided timezone
        console.log('Provided timezone:', userTimezone, 'Validation result:', moment.tz.zone(userTimezone));

        if (!userTimezone || moment.tz.zone(userTimezone) === null) {
            message.channel.send("The time zone format was incorrect or not provided. Please provide a valid time zone. For a list of valid  TZ formatted time zones, visit https://en.wikipedia.org/wiki/List_of_tz_database_time_zones.");
            return; // Exit if invalid timezone
        }

        const markets = [
            { name: 'New York', open: '09:30', close: '16:00', tz: 'America/New_York', abbreviation: 'EDT' },
            { name: 'London', open: '08:00', close: '16:30', tz: 'Europe/London', abbreviation: 'BST' },
            { name: 'Shanghai', open: '09:30', close: '15:00', tz: 'Asia/Shanghai', abbreviation: 'CST' },
            { name: 'Tokyo', open: '09:00', close: '15:00', tz: 'Asia/Tokyo', abbreviation: 'JST' },
            { name: 'Shenzhen', open: '09:30', close: '14:57', tz: 'Asia/Shanghai', abbreviation: 'CST' },
            { name: 'Hong Kong', open: '09:30', close: '16:00', tz: 'Asia/Hong_Kong', abbreviation: 'HKT' },
            { name: 'Seoul', open: '09:00', close: '15:30', tz: 'Asia/Seoul', abbreviation: 'KST' },
        ];

        let response = `Market Open and Close Times (${userTimezone}):\n\`\`\``;
        markets.forEach(market => {
            // Parse open and close times in their respective market time zones
            const openTime = moment.tz(`${moment().format('YYYY-MM-DD')} ${market.open}`, market.tz);
            const closeTime = moment.tz(`${moment().format('YYYY-MM-DD')} ${market.close}`, market.tz);

            // Convert open and close times to the user's specified time zone
            const userOpenTime = openTime.clone().tz(userTimezone).format('hh:mm A');
            const userCloseTime = closeTime.clone().tz(userTimezone).format('hh:mm A');

            response += `\n${market.name}: Opens at ${userOpenTime}, Closes at ${userCloseTime}`;
        });
        response += '\`\`\`';

        message.channel.send(response);

    },
};