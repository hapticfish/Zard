// const AlertModel = require('../database/alertModel'); // Adjust path as necessary
// const moment = require('moment');
//
// module.exports = {
//     name: 'showalerts',
//     execute: async (message) => {
//         const userId = message.author.id; // Discord user ID
//
//         try {
//             const alerts = await AlertModel.getActiveAlerts(userId);
//             if (alerts.length === 0) {
//                 return message.channel.send('You have no active alerts.');
//             }
//
//             let response = 'Your active alerts:\n```\nID | Pair | Target Price | Direction | Type | Status | Created At\n';
//             alerts.forEach(({ id, crypto_pair, target_price, direction, alert_type, status, creation_date }) => {
//                 // Format creation date using moment for simplified output
//                 const formattedDate = moment(creation_date).format('YYYY-MM-DD HH:mm:ss');
//                 response += `${id} | ${crypto_pair} | ${target_price} | ${direction} | ${alert_type} | ${status} | ${formattedDate}\n`;
//             });
//             response += '```';
//
//             message.channel.send(response);
//         } catch (error) {
//             console.error(error);
//             message.channel.send('Failed to retrieve alerts.');
//         }
//     },
// };
