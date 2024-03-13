const { formatPairForAllExchanges } = require('../utils/currencyUtils');

module.exports = {
    name: 'convert',
    execute: async (message, args) => {
        if (args.length < 3) {
            return message.channel.send('Usage: !convert <amount> <from_currency> <to_currency>');
        }

        const amount = parseFloat(args[0]);
        let fromCurrency = args[1].toUpperCase();
        let toCurrency = args[2].toUpperCase();

        if (isNaN(amount)) {
            return message.channel.send('Please provide a valid amount for conversion.');
        }

        // Avoid appending "USDT" to "USDT" for either currency
        const fromPairSymbol = fromCurrency === 'USDT' ? 'USDT' : fromCurrency + 'USDT';
        const toPairSymbol = toCurrency === 'USDT' ? 'USDT' : toCurrency + 'USDT';

        // Dynamically import node-fetch
        let fetch;
        try {
            fetch = (await import('node-fetch')).default;
        } catch (error) {
            console.error('Failed to import node-fetch:', error);
            return message.channel.send('There was an error processing your request.');
        }

        try {
            // Fetch price for the fromCurrency to USDT (if fromCurrency is not USDT)
            let convertedAmount = amount;
            if (fromCurrency !== 'USDT') {
                const apiUrlFrom = `https://api.binance.com/api/v3/ticker/price?symbol=${fromPairSymbol}`;
                const responseFrom = await fetch(apiUrlFrom).then(res => res.json());

                if (!responseFrom.price) {
                    return message.channel.send(`Could not fetch price for conversion from ${fromCurrency} to USDT.`);
                }

                const conversionRateFrom = parseFloat(responseFrom.price);
                convertedAmount *= conversionRateFrom;
            }

            // Convert USDT to toCurrency (if toCurrency is not USDT)
            if (toCurrency !== 'USDT') {
                const apiUrlTo = `https://api.binance.com/api/v3/ticker/price?symbol=${toPairSymbol}`;
                const responseTo = await fetch(apiUrlTo).then(res => res.json());

                if (!responseTo.price) {
                    return message.channel.send(`Could not fetch price for conversion from USDT to ${toCurrency}.`);
                }

                const conversionRateTo = 1 / parseFloat(responseTo.price);
                convertedAmount *= conversionRateTo;
            }

            // Send the conversion result to the Discord channel
            message.channel.send(`${amount} ${args[1].toUpperCase()} is equivalent to ${convertedAmount.toFixed(5)} ${args[2].toUpperCase()}.`);
        } catch (error) {
            console.error('Error fetching the conversion rate:', error);
            message.channel.send('There was an error fetching the conversion rate.');
        }
    },
};
