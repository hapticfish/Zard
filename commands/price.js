module.exports = {
    name: 'price',
    execute: async (message, args) => {
        console.log(`Message received: ${message.content}`);
        console.log('!price command received'); // Confirm command is detected
        console.log('User Args: ' + args[0]?.toLowerCase());

        if (!args.length) {
            return message.channel.send('You need to provide the ticker symbol of the cryptocurrency.');
        }

        const symbol = args[0].toUpperCase(); // Ensure symbol is uppercase for normalization

        // Normalize and format pairs for each exchange
        const normalizedPair = symbol.replace(/[-\s]/g, '').toUpperCase();
        const formattedPairs = formatPairForAllExchanges(normalizedPair);

        // Construct API URLs for each exchange
        const apiUrls = {
            'BINANCE': `https://api.binance.com/api/v3/ticker/price?symbol=${formattedPairs.BINANCE}`,
            'COINBASE': `https://api.coinbase.com/v2/prices/${formattedPairs.COINBASE}/spot`,
            'MEXC': `https://www.mexc.com/open/api/v2/market/ticker?symbol=${formattedPairs.MEXC}`
        };

        try {
            // Dynamically import node-fetch
            const fetch = (await import('node-fetch')).default;

            // Fetch prices from all exchanges concurrently
            const responses = await Promise.all([
                fetch(apiUrls.BINANCE).then(res => res.json()),
                fetch(apiUrls.COINBASE).then(res => res.json()),
                fetch(apiUrls.MEXC).then(res => res.json()),
            ]);

            // Extract price information from responses
            const binancePrice = responses[0].symbol ? `${responses[0].symbol} Binance ${truncateToFiveDec(responses[0].price)}` : 'Binance: Symbol not found/error fetching price.';
            const coinbasePrice = responses[1].data ? `${responses[1].data.base}-${responses[1].data.currency} Coinbase ${truncateToFiveDec(responses[1].data.amount)}` : 'Coinbase: Symbol not found/error fetching price.';
            // Adjust according to MEXC's actual response structure
            const mexcPrice = responses[2].data && responses[2].data.length > 0 ? `${responses[2].data[0].symbol} MEXC ${truncateToFiveDec(responses[2].data[0].last)}` : 'MEXC: Symbol not found/error fetching price.';

            // Send the price information to the Discord channel
            message.channel.send(`${binancePrice}\n${coinbasePrice}\n${mexcPrice}`);
        } catch (error) {
            console.error(error);
            message.channel.send('There was an error fetching the cryptocurrency prices.');
        }
    },
};

function formatPairForAllExchanges(normalizedPair) {
    const formatRules = {
        'BINANCE': (pair) => pair,
        'COINBASE': (pair) => pair.slice(0, 3) + '-' + pair.slice(3),
        'MEXC': (pair) => pair.slice(0, 3) + '_' + pair.slice(3),
    };

    let formattedPairs = {};

    for (const [exchange, formatter] of Object.entries(formatRules)) {
        formattedPairs[exchange] = formatter(normalizedPair);
    }

    return formattedPairs;
}

function truncateToFiveDec(num) {
    return Math.floor(num * 100000) / 100000;
}
