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

module.exports = {
    formatPairForAllExchanges,
    truncateToFiveDec
};