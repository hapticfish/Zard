//
// const moment = require('moment-timezone');
//
// module.exports = {
//     name: 'mo',
//     // Check for user provided timezone
//     execute(message, args) {
//         console.log(`Message received: ${message.content}`);
//         console.log('!mo command received'); // Confirm command is detected
//
//         const userTimezone = args[0] || 'UTC';
//
//         // Debugging: Log the moment.tz.zone output for the provided timezone
//         console.log('Provided timezone:', userTimezone, 'Validation result:', moment.tz.zone(userTimezone));
//
//         if (!userTimezone || moment.tz.zone(userTimezone) === null) {
//             message.channel.send("The time zone format was incorrect or not provided. Please provide a valid time zone. For a list of valid  TZ formatted time zones, visit https://en.wikipedia.org/wiki/List_of_tz_database_time_zones.");
//             return; // Exit if invalid timezone
//         }
//
//         const markets = [
//             { name: 'New York', open: '09:30', close: '16:00', tz: 'America/New_York', abbreviation: 'EDT' },
//             { name: 'London', open: '08:00', close: '16:30', tz: 'Europe/London', abbreviation: 'BST' },
//             { name: 'Shanghai', open: '09:30', close: '15:00', tz: 'Asia/Shanghai', abbreviation: 'CST' },
//             { name: 'Tokyo', open: '09:00', close: '15:00', tz: 'Asia/Tokyo', abbreviation: 'JST' },
//             { name: 'Shenzhen', open: '09:30', close: '14:57', tz: 'Asia/Shanghai', abbreviation: 'CST' },
//             { name: 'Hong Kong', open: '09:30', close: '16:00', tz: 'Asia/Hong_Kong', abbreviation: 'HKT' },
//             { name: 'Seoul', open: '09:00', close: '15:30', tz: 'Asia/Seoul', abbreviation: 'KST' },
//         ].map(market => {
//             const now = moment().tz(userTimezone);
//             const openTime = moment.tz(`${moment().format('YYYY-MM-DD')} ${market.open}`, market.tz).tz(userTimezone);
//             const closeTime = moment.tz(`${moment().format('YYYY-MM-DD')} ${market.close}`, market.tz).tz(userTimezone);
//
//             let status, timeUntilSort, timeUntilDisplay;
//             if (now.isBetween(openTime, closeTime)) {
//                 status = 'Open';
//                 const duration = moment.duration(closeTime.diff(now));
//                 timeUntilSort = closeTime.diff(now);
//                 timeUntilDisplay = `Closes in ${duration.hours()} hour(s) and ${duration.minutes()} minute(s)`;
//             } else {
//                 status = 'Closed';
//                 const nextOpenTime = now.isBefore(openTime) ? openTime : moment.tz(`${moment().add(1, 'days').format('YYYY-MM-DD')} ${market.open}`, market.tz).tz(userTimezone);
//                 const duration = moment.duration(nextOpenTime.diff(now));
//                 timeUntilSort = nextOpenTime.diff(now);
//                 timeUntilDisplay = `Opens in ${duration.hours()} hour(s) and ${duration.minutes()} minute(s)`;
//             }
//
//             return { ...market, status, timeUntilSort, timeUntilDisplay };
//         });
//
//         // Sort markets based on their status (Open first) and time until they open/close
//         markets.sort((a, b) => a.status === 'Closed' && b.status === 'Open' ? 1 : a.status === 'Open' && b.status === 'Closed' ? -1 : a.timeUntilSort - b.timeUntilSort);
//
//         let response = `Market Open and Close Times (${userTimezone}):\n\`\`\``;
//         markets.forEach(market => {
//             response += `\n${market.name}: ${market.status} (${market.timeUntilDisplay})`;
//         });
//         response += '\`\`\`';
//
//         message.channel.send(response);
//     },
// };