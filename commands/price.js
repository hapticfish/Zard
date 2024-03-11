const { formatPairForAllExchanges, truncateToFiveDec } = require('../utils/currencyUtils');

async function fetchWithLogging(url, exchange) {
    // Dynamically import node-fetch
    const fetch = (await import('node-fetch')).default;
    console.log(`Requesting data from ${exchange}: ${url}`);
    const response = await fetch(url);
    console.log(`${exchange} response status: ${response.status}`);
    const data = await response.json();
    console.log(`${exchange} raw data: `, JSON.stringify(data));
    return data;
}

module.exports = {
    name: 'price',
    execute: async (message, args) => {
        console.log(`Message received: ${message.content}`);
        console.log('!price command received');
        console.log('User Args: ' + args[0]?.toLowerCase());

        if (!args.length) {
            return message.channel.send('You need to provide the ticker symbol of the cryptocurrency.');
        }

        const symbol = args[0].toUpperCase();
        const normalizedPair = symbol.replace(/[-\s]/g, '').toUpperCase();
        const formattedPairs = formatPairForAllExchanges(normalizedPair);

        const apiUrls = {
            'BINANCE': `https://api.binance.com/api/v3/ticker/price?symbol=${formattedPairs.BINANCE}`,
            'COINBASE': `https://api.coinbase.com/v2/prices/${formattedPairs.COINBASE}/spot`,
            'MEXC': `https://www.mexc.com/open/api/v2/market/ticker?symbol=${formattedPairs.MEXC}`
        };

        try {
            const responses = await Promise.all(Object.entries(apiUrls).map(async ([exchange, url]) => {
                return fetchWithLogging(url, exchange).then(data => ({ exchange, data }));
            }));

            responses.forEach(({ exchange, data }) => {
                let priceMessage = '';
                switch (exchange) {
                    case 'BINANCE':
                        priceMessage = data.symbol ? `${data.symbol} Binance ${truncateToFiveDec(data.price)}` : 'Binance: Symbol not found/error fetching price.';
                        break;
                    case 'COINBASE':
                        priceMessage = data.data ? `${data.data.base}-${data.data.currency} Coinbase ${truncateToFiveDec(data.data.amount)}` : 'Coinbase: Symbol not found/error fetching price.';
                        break;
                    case 'MEXC':
                        priceMessage = (data.data && data.data.length > 0) ? `${data.data[0].symbol} MEXC ${truncateToFiveDec(data.data[0].last)}` : 'MEXC: Symbol not found/error fetching price.';
                        break;
                }
                message.channel.send(priceMessage);
            });
        } catch (error) {
            console.error(error);
            message.channel.send('There was an error fetching the cryptocurrency prices.');
        }
    },
};
