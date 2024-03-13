const WebSocket = require('ws');
const subscribers = {};

function subscribeToPair(pair, callback) {
    // If this is the first subscription to the pair, initialize its list of callbacks and subscribe via WebSocket
    if (!subscribers[pair]) {
        subscribers[pair] = [callback];
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${pair.toLowerCase()}@trade`);
        ws.on('message', (message) => {
            const { p: price } = JSON.parse(message);
            subscribers[pair].forEach(cb => cb(price));
        });
    } else {
        subscribers[pair].push(callback);
    }
}

module.exports = { subscribeToPair };
