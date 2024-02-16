// const fetch = require('node-fetch');

module.exports = {
    name: 'price',
    execute:async (message, args) => {
        console.log(`Message received: ${message.content}`);
        console.log('!price command received'); // Confirm command is detected
        console.log('user Args: ' + args[0]?.toLowerCase);

        if (!args.length) {
            return message.channel.send('You need to provide the ticker symbol of the cryptocurrency.');
        }

        const ticker = args[0].toLowerCase();

        // Dynamically import node-fetch
        const fetch = (await import('node-fetch')).default;

        try {
            const priceResponse = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&symbols=${ticker}`);
            const prices = await priceResponse.json();
            if (!prices.length) {
                return message.channel.send(`Could not find a cryptocurrency with the ticker symbol "${ticker.toUpperCase()}".`);
            }

            const coin = prices[0]; // Assuming the first match is what we want
            const exchanges = ['coinbase', 'binance', 'mexc'];
            let response = `Prices for ${coin.name} (${ticker.toUpperCase()}):\n`;

            exchanges.forEach(exchange => {
                // This is a conceptual approach; you'd need to adapt it based on actual API data structure and availability
                const priceInfo = coin[exchange]; // Placeholder for how you might access exchange-specific price data
                if (priceInfo) {
                    response += `${exchange.charAt(0).toUpperCase() + exchange.slice(1)}: $${priceInfo.usd}\n`;
                } else {
                    response += `${exchange.charAt(0).toUpperCase() + exchange.slice(1)}: Not Listed\n`;
                }
            });

            message.channel.send(response);
        } catch (error) {
            console.error(error);
            message.channel.send('There was an error fetching the cryptocurrency price.');
        }
    },
};