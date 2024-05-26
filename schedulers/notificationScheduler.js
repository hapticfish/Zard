const cron = require('node-cron');
const moment = require('moment-timezone');
const db = require('../database/tf-notificationModel'); // Adjust the path as necessary

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
            return next4HourInterval.add(4, 'hours');
        // Add other event types as needed
        default:
            return currentUTC; // Default to current time if event type is not recognized
    }
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
