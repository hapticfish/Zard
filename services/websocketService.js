const WebSocket = require('ws');
const AlertModel = require('../database/alertModel');

const subscribers = {};

function subscribeToPair(pair, alertId, targetPrice, direction, callback) {
    // Validate the callback is a function
    if (typeof callback !== 'function') {
        throw new Error('The callback must be a function.');
    }

    // Initialize subscription for the pair if it doesn't exist
    if (!subscribers[pair]) {
        subscribers[pair] = {};
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${pair.toLowerCase()}@trade`);

        ws.on('open', function open() {
            console.log(`Connected to WebSocket for pair ${pair}`);
        });

        ws.on('message', function incoming(data) {
            const message = JSON.parse(data);
            const { p: price } = message;
            const priceFloat = parseFloat(price);
            // Evaluate the alert condition based on direction and target price
            const shouldTriggerAlert = (direction === 'above' && priceFloat >= targetPrice) || (direction === 'below' && priceFloat <= targetPrice);

            if (shouldTriggerAlert) {
                Object.keys(subscribers[pair]).forEach((id) => {
                    if (typeof subscribers[pair][id].callback === 'function') {
                        subscribers[pair][id].callback(priceFloat, id);
                    }
                });
            }
        });

        ws.on('error', function handleError(error) {
            console.error('WebSocket encountered an error:', error);
            if (error.message.includes('451')) {
                console.error('Error code: 451. Unable to collect data. Accessing Binance from potentially restricted region.');
                // Consider implementing a retry mechanism or alternative data source
            }
        });
    }

    // Register the alert details including direction, targetPrice, and callback for this alert
    subscribers[pair][alertId] = {
        targetPrice,
        direction,
        callback: async (price) => {
            await callback(price, alertId);
            // Consider calling handlePriceUpdate here if you want to automatically deactivate alerts upon triggering
        }
    };
}

async function handlePriceUpdate(price, alertId) {
    // This function would be called to deactivate the alert and perform cleanup
    try {
        // Deactivate alert after it's been triggered
        await AlertModel.deactivateAlert(alertId);
        // Remove the alert from subscribers to stop further notifications
        Object.keys(subscribers).forEach(pair => {
            if (subscribers[pair][alertId]) {
                delete subscribers[pair][alertId];
            }
        });
    } catch (error) {
        console.error('Error handling price update:', error);
    }
}

module.exports = { subscribeToPair, handlePriceUpdate };
