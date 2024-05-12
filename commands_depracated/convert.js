// const { formatPairForAllExchanges } = require('../utils/currencyUtils');
//
// module.exports = {
//     name: 'convert',
//     execute: async (message, args) => {
//         if (args.length < 3) {
//             return message.channel.send('Usage: !convert <amount> <from_currency> <to_currency>');
//         }
//
//         const amount = parseFloat(args[0]);
//         let fromCurrency = args[1].toUpperCase();
//         let toCurrency = args[2].toUpperCase();
//
//         if (isNaN(amount)) {
//             return message.channel.send('Please provide a valid amount for conversion.');
//         }
//
//         const fromPairSymbol = fromCurrency === 'USDT' ? 'USDT' : fromCurrency + 'USDT';
//         const toPairSymbol = toCurrency === 'USDT' ? 'USDT' : toCurrency + 'USDT';
//
//         let fetch;
//         try {
//             fetch = (await import('node-fetch')).default;
//         } catch (error) {
//             console.error('Failed to import node-fetch:', error);
//             return message.channel.send('There was an error processing your request.');
//         }
//
//         try {
//             let convertedAmount = amount;
//             if (fromCurrency !== 'USDT') {
//                 const responseFrom = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${fromPairSymbol}`).then(res => res.json());
//                 if (!responseFrom.price) {
//                     if (responseFrom.status === 451) {
//                         return message.channel.send('Failed: restricted region access');
//                     }
//                     return message.channel.send(`Could not fetch price for conversion from ${fromCurrency} to USDT.`);
//                 }
//                 convertedAmount *= parseFloat(responseFrom.price);
//             }
//
//             if (toCurrency !== 'USDT') {
//                 const responseTo = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${toPairSymbol}`).then(res => res.json());
//                 if (!responseTo.price) {
//                     if (responseTo.status === 451) {
//                         return message.channel.send('Failed: restricted region access');
//                     }
//                     return message.channel.send(`Could not fetch price for conversion from USDT to ${toCurrency}.`);
//                 }
//                 convertedAmount *= 1 / parseFloat(responseTo.price);
//             }
//
//             message.channel.send(`${amount} ${fromCurrency} is equivalent to ${convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 5, maximumFractionDigits: 5 })} ${toCurrency}.`);
//         } catch (error) {
//             console.error('Error fetching the conversion rate:', error);
//             if (error.message && error.message.includes('451')) {
//                 message.channel.send('Failed: restricted region access');
//             } else {
//                 message.channel.send('There was an error fetching the conversion rate.');
//             }
//         }
//     },
// };
