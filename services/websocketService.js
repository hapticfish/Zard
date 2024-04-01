const WebSocket = require('ws');
const AlertModel = require('../database/alertModel');

const subscribers = {};

function subscribeToPair(pair, alertId, targetPrice, direction, callback) {
    console.log(`Subscribing to pair: ${pair} with alertId: ${alertId}, targetPrice: ${targetPrice}, direction: ${direction}`);
    if (typeof callback !== 'function') {
        throw new Error('The callback must be a function.');
    }

    // Initialize subscription for the pair if it doesn't exist
    if (!subscribers[pair]) {
        subscribers[pair] = {};
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${pair.toLowerCase()}@trade`);

        ws.on('open', () => console.log(`Connected to WebSocket for pair ${pair}`));

        ws.on('message', (data) => {
            const { p: price } = JSON.parse(data);
            const priceFloat = parseFloat(price);
            // Evaluate the alert condition based on direction and target price
            const shouldTriggerAlert = (direction === 'above' && priceFloat >= targetPrice) || (direction === 'below' && priceFloat <= targetPrice);

            const alertDetails = subscribers[pair][alertId];
            if (alertDetails && !alertDetails.triggered) {
                if ((direction === 'above' && priceFloat >= targetPrice) || (direction === 'below' && priceFloat <= targetPrice)) {
                    console.log(`Alert ${alertId} condition met. Price: ${priceFloat}`);
                    alertDetails.triggered = true; // Mark the alert as triggered to prevent duplicate triggers
                    callback(priceFloat, alertId).then(() => {
                        console.log(`Callback executed for Alert ${alertId}. Now triggering and deactivating.`);
                        AlertModel.triggerAlert(alertId).then(alert => {
                            console.log(`Alert ${alertId} triggered with details: `, alert);
                            AlertModel.deactivateAlert(alertId, "Triggered").then(() => {
                                console.log(`Alert ${alertId} deactivated.`);
                                delete subscribers[pair][alertId]; // Ensure cleanup is done after deactivation
                            }).catch(deactivateError => console.error(`Error deactivating Alert ${alertId}:`, deactivateError));
                        }).catch(triggerError => console.error(`Error triggering Alert ${alertId}:`, triggerError));
                    });
                }
            }
        });

        ws.on('error', (error) => {
            console.error('WebSocket encountered an error:', error);
            if (error.message.includes('451')) {
                console.error('Error code: 451. Unable to collect data. Accessing Binance from potentially restricted region.');
                // Consider implementing a retry mechanism or alternative data source
            }
        });
    }

    // Initialize the alert details with a 'triggered' flag to false
    subscribers[pair][alertId] = { targetPrice, direction, callback, triggered: false };
}

async function handlePriceUpdate(price, alertId) {
    console.log(`handlePriceUpdate called for Alert ${alertId} with price: ${price}`);
    try {
        // Deactivate alert after it's been triggered
        await AlertModel.deactivateAlert(alertId);
        console.log(`Alert ${alertId} deactivated after price update.`);
        Object.keys(subscribers).forEach((pair) => {
            if (subscribers[pair][alertId]) {
                console.log(`Deleting Alert ${alertId} from subscribers.`);
                delete subscribers[pair][alertId];
            }
        });
    } catch (error) {
        console.error(`Error handling price update for Alert ${alertId}:`, error);
    }
}

module.exports = { subscribeToPair, handlePriceUpdate };


//todo alerts being created but now not triggered. succesfully showing in log that their created and
//todo also showing created in database.
