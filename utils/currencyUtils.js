
const fetch = require('node-fetch');
function formatPairForAllExchanges(normalizedPair) {
    const formatRules = {
        'BINANCE': pair => pair,
        'COINBASE': pair => pair.slice(0, 3) + '-' + pair.slice(3),
        'MEXC': pair => pair.slice(0, 3) + '_' + pair.slice(3),
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

async function fetchMarketData(symbol) {
    const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol.toUpperCase()}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error fetching market data for ${symbol}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

module.exports = {
    formatPairForAllExchanges,
    truncateToFiveDec,
    fetchMarketData
};