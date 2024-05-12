//
// const AlertModel = require('../database/alertModel');
// module.exports = {
//     name: 'deleteallalerts',
//     description: 'Deletes all alerts set by the user.',
//     execute: async (message, args) => {
//         const userId = message.author.id; // Or however you get the user ID
//
//         try {
//             await AlertModel.deactivateAllAlerts(userId, 'User deactivated all alerts');
//             message.channel.send('All your alerts have been successfully deleted.');
//         } catch (error) {
//             console.error(error);
//             message.channel.send('Failed to delete alerts. Please try again later.');
//         }
//     },
// };