const { formatPairForAllExchanges } = require('../utils/currencyUtils');

module.exports = {
    name: 'convert',
    execute: async (message, args) => {
        if (args.length < 3) {
            return message.channel.send('Usage: !convert <amount> <from_currency> <to_currency>');
        }

        const amount = parseFloat(args[0]);
        const fromCurrencyTicker = args[1].toUpperCase();
        const toCurrencyTicker = args[2].toUpperCase();

        if (isNaN(amount)) {
            return message.channel.send('Please provide a valid amount for conversion.');
        }

        const fromCurrency = fromCurrencyTicker + 'USDT';
        const toCurrency = toCurrencyTicker + 'USDT';

        // Dynamically import node-fetch
        let fetch;
        try {
            fetch = (await import('node-fetch')).default;
        } catch (error) {
            console.error('Failed to import node-fetch:', error);
            return message.channel.send('There was an error processing your request.');
        }

        try {
            // Fetch prices for both conversion pairs from the API
            const apiUrlFrom = `https://api.binance.com/api/v3/ticker/price?symbol=${fromCurrency}`;
            const apiUrlTo = `https://api.binance.com/api/v3/ticker/price?symbol=${toCurrency}`;

            const responseFrom = await fetch(apiUrlFrom).then(res => res.json());
            const responseTo = await fetch(apiUrlTo).then(res => res.json());

            if (!responseFrom.price || !responseTo.price) {
                return message.channel.send(`Could not fetch prices for ${fromCurrencyTicker} to ${toCurrencyTicker} conversion.`);
            }

            const conversionRateFrom = parseFloat(responseFrom.price);
            const conversionRateTo = parseFloat(responseTo.price);
            const convertedAmount = (amount * conversionRateFrom) / conversionRateTo;

            // Send the conversion result to the Discord channel
            message.channel.send(`${amount} ${fromCurrencyTicker} is equivalent to ${convertedAmount.toFixed(5)} ${toCurrencyTicker} (approximated through USDT).`);
        } catch (error) {
            console.error('Error fetching the conversion rate:', error);
            message.channel.send('There was an error fetching the conversion rate.');
        }
    },
};
