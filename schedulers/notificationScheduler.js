const cron = require('node-cron');
const moment = require('moment-timezone');
const db = require('../database/tfnotificationsModel'); // Adjust the path as necessary

module.exports = {
    init() {
        // Schedule a task to check for notifications every minute
        cron.schedule('* * * * *', async () => {
            const notifications = await db.getEnabledNotifications(); // Get all enabled notifications

            notifications.forEach(notification => {
                const currentTime = moment.utc(); // Get the current UTC time

                const eventTime = getEventTime(notification.event_type); // Calculate the next event time in UTC
                const firstWarningTime = eventTime.clone().subtract(parseDuration(notification.warning_1)); // Calculate the first warning time
                const secondWarningTime = eventTime.clone().subtract(parseDuration(notification.warning_2)); // Calculate the second warning time

                if (currentTime.isSame(firstWarningTime, 'minute')) {
                    sendNotification(notification.user_id, `First warning for ${notification.event_type} event`);
                }

                if (currentTime.isSame(secondWarningTime, 'minute')) {
                    sendNotification(notification.user_id, `Second warning for ${notification.event_type} event`);
                }
            });
        });
    }
};

// Function to get event time based on type
function getEventTime(eventType) {
    const currentUTC = moment.utc();
    switch (eventType) {
        case '1h':
            return currentUTC.clone().startOf('hour').add(1, 'hour'); // Next hourly event
        case '4h':
            // Find the next 4-hour interval (00:00, 04:00, 08:00, etc.)
            const next4HourInterval = currentUTC.clone().startOf('hour');
            while (next4HourInterval.hour() % 4 !== 0) {
                next4HourInterval.add(1, 'hour');
            }
            return next4HourInterval;
        case 'daily':
            return currentUTC.clone().startOf('day').add(1, 'day'); // Next daily event
        case 'weekly':
            return currentUTC.clone().startOf('isoWeek').add(1, 'week'); // Next weekly event
        case 'monthly':
            return currentUTC.clone().startOf('month').add(1, 'month'); // Next monthly event
        case 'quarterly':
            return currentUTC.clone().startOf('quarter').add(1, 'quarter'); // Next quarterly event
        case 'cme_open':
            return getNextCMEEvent('open');
        case 'cme_close':
            return getNextCMEEvent('close');
        case 'market_open':
            return getNextMarketEventTime(eventType);
        default:
            return currentUTC; // Default to current time if event type is not recognized
    }
}

// Function to get the next CME open or close time
function getNextCMEEvent(event) {
    const currentUTC = moment.utc();
    const cmeOpenHourUTC = 22; // 16:00 CST is 22:00 UTC
    const cmeCloseHourUTC = 22; // 16:00 CST is 22:00 UTC

    if (event === 'open') {
        // If today is Sunday and before 22:00 UTC
        if (currentUTC.day() === 0 && currentUTC.hour() < cmeOpenHourUTC) {
            return currentUTC.clone().startOf('day').hour(cmeOpenHourUTC);
        } else {
            // Otherwise, the next open is the following Sunday at 22:00 UTC
            const nextSunday = currentUTC.clone().day(0 + 7).startOf('day').hour(cmeOpenHourUTC);
            return nextSunday;
        }
    } else if (event === 'close') {
        // If today is Friday and before 22:00 UTC
        if (currentUTC.day() === 5 && currentUTC.hour() < cmeCloseHourUTC) {
            return currentUTC.clone().startOf('day').hour(cmeCloseHourUTC);
        } else {
            // Otherwise, the next close is the following Friday at 22:00 UTC
            const nextFriday = currentUTC.clone().day(5 + 7).startOf('day').hour(cmeCloseHourUTC);
            return nextFriday;
        }
    }

    return currentUTC; // Fallback to current time if logic fails
}

// Function to get the next market open or close time based on known market schedules
function getNextMarketEventTime(eventType) {
    const currentUTC = moment.utc();
    const markets = [
        { name: 'New York', open: '09:30', close: '16:00', tz: 'America/New_York' },
        { name: 'London', open: '08:00', close: '16:30', tz: 'Europe/London' },
        { name: 'Shanghai', open: '09:30', close: '15:00', tz: 'Asia/Shanghai' },
        { name: 'Tokyo', open: '09:00', close: '15:00', tz: 'Asia/Tokyo' },
        { name: 'Shenzhen', open: '09:30', close: '14:57', tz: 'Asia/Shanghai' },
        { name: 'Hong Kong', open: '09:30', close: '16:00', tz: 'Asia/Hong_Kong' },
        { name: 'Seoul', open: '09:00', close: '15:30', tz: 'Asia/Seoul' },
    ];

    let nextEventTime = moment.utc().add(1, 'day'); // Initialize with a time far in the future

    markets.forEach(market => {
        const openTime = moment.tz(`${moment().format('YYYY-MM-DD')} ${market.open}`, market.tz).utc();
        const closeTime = moment.tz(`${moment().format('YYYY-MM-DD')} ${market.close}`, market.tz).utc();

        if (eventType === 'market_open') {
            if (currentUTC.isBefore(openTime) && openTime.isBefore(nextEventTime)) {
                nextEventTime = openTime;
            }
        } else if (eventType === 'market_close') {
            if (currentUTC.isBefore(closeTime) && closeTime.isBefore(nextEventTime)) {
                nextEventTime = closeTime;
            }
        }
    });

    return nextEventTime;
}

// Function to parse duration strings like '10m', '1h', etc.
function parseDuration(duration) {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1), 10);

    switch (unit) {
        case 'm':
            return moment.duration(value, 'minutes');
        case 'h':
            return moment.duration(value, 'hours');
        case 'd':
            return moment.duration(value, 'days');
        case 'w':
            return moment.duration(value, 'weeks');
        default:
            return moment.duration(0); // Default to zero duration
    }
}

// Function to send notification (implement as needed)
function sendNotification(userId, message) {
    // Send the notification to the user
    console.log(`Sending notification to user ${userId}: ${message}`);
}
