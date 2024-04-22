// websocketUtils.js

let CBChannelTypeLogTime = 0;
const logInterval = 4000; // Log interval in milliseconds

function handleCoinbaseMessage(info, currentTime) {
    const currentTimeHR = new Date(currentTime).toLocaleString();

    if (currentTime - CBChannelTypeLogTime > logInterval) {
        switch (info.type) {
            case 'ticker':
                // Ticker messages are likely handled elsewhere if they include price data.
                console.log(`Ticker message received: Price = ${info.price || 'N/A'}, Time = ${currentTimeHR}`, info);
                break;
            case 'subscriptions':
                console.log(`Subscriptions message received:`, info);
                break;
            case 'heartbeat':
                console.log(`Heartbeat received:`, info);
                break;
            default:
                console.log(`Unknown message type received from Coinbase: ${info.type}`, info);
                break;
        }
        CBChannelTypeLogTime = currentTime;  // Update last logged time
    }
}

function calculateReconnectDelay(attemptNumber) {
    const initialDelay = 1000; // 1 second
    const maxDelay = 30000;    // 30 seconds
    return Math.min(initialDelay * Math.pow(2, attemptNumber), maxDelay);
}

module.exports = {
    handleCoinbaseMessage, calculateReconnectDelay
};
