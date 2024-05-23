const moment = require('moment-timezone');

/**
 * Converts a timestamp from the server's timezone (or UTC) to the user's local timezone.
 * @param {string} timestamp - The timestamp to convert.
 * @param {string} userTimezone - The user's local timezone.
 * @returns {string} - The converted timestamp in the user's local timezone.
 */
function convertToUserTimezone(timestamp, userTimezone) {
    return moment(timestamp).tz(userTimezone).format('YYYY-MM-DD HH:mm:ss');
}

module.exports = {
    convertToUserTimezone
};