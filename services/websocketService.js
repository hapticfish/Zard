const WebSocket = require('ws');
const AlertModel = require('../database/alertModel');

const subscribers = {};

let lastLogTime = 0; // Timestamp of the last log for rate-limited logging
const logInterval = 4000; // Log interval in milliseconds (4 seconds)
const notificationCooldown = 5000; // 15 minutes cooldown for notifications
const priceThresholdPercentage = 0.0001475; // 0.01475% threshold for price difference

function subscribeToPair(pair, alertId, targetPrice, direction, alertType, callback) {
    console.log(`Subscribing to pair: ${pair} with alertId: ${alertId}, targetPrice: ${targetPrice}, direction: ${direction}, type: ${alertType}`);

    if (typeof callback !== 'function') {
        throw new Error('Callback must be a function.');
    }

    // Initialize subscription for the pair if it doesn't exist
    if (!subscribers[pair]) {
        subscribers[pair] = {};
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${pair.toLowerCase()}@trade`);

        ws.on('open', () => console.log(`Connected to WebSocket for pair ${pair}.`));

        ws.on('message', async (data) => {
            const currentTime = Date.now();
            const parsedData = JSON.parse(data);
            const priceFloat = parseFloat(parsedData.p);

            // Skip processing if the alert has been deleted or deactivated
            if (!subscribers[pair] || !subscribers[pair][alertId]) {
                return;
            }

            // Check if alert has been deleted or deactivated before proceeding
            const status = await AlertModel.fetchAlertStatus(alertId);
            if (status !== 'Active' && status !== 'Triggered') {
                console.log(`Alert ${alertId} is not active or triggered (status: ${status}). Skipping.`);
                delete subscribers[pair][alertId];
                return;
            }

            if (currentTime - lastLogTime > logInterval) {
                console.log(`Received trade data for ${pair}: price = ${priceFloat}`);
                console.log(`Evaluating alert condition for ${pair}. Current price: ${priceFloat}, Target price: ${targetPrice}, Direction: ${direction}`);
                lastLogTime = currentTime;
            }

            const { p: price } = JSON.parse(data);

            const alertDetails = subscribers[pair][alertId];
            if (!alertDetails) return;

            const priceDifferencePercentage = Math.abs((priceFloat - targetPrice) / targetPrice);
            const isWithinThreshold = priceDifferencePercentage <= priceThresholdPercentage;
            const timeSinceLastNotification = currentTime - (alertDetails.lastNotificationTime || 0);
            const shouldNotify = timeSinceLastNotification >= notificationCooldown;



            // Re-introducing shouldTriggerAlert for clarity and control
            const shouldTriggerAlert = (direction === 'above' && priceFloat > targetPrice) || (direction === 'below' && priceFloat < targetPrice);

            if (shouldTriggerAlert && (shouldNotify || alertType === 'standard')) {

                // // For perpetual alerts, ensure they are reactivated if they were previously triggered
                // if (status === 'Triggered' && alertType === 'perpetual') {
                //     await AlertModel.reactivateAlert(alertId);  // This function needs to be implemented
                //     alertDetails.triggered = false; // Reset the triggered flag for perpetual alerts
                // }

                if (isWithinThreshold || alertType === 'standard') {
                    alertDetails.lastNotificationTime = currentTime; // Update notification time only if within threshold or standard alert

                    console.log(`Alert ${alertId} condition met. Price: ${priceFloat}`);
                    callback(priceFloat, alertId).then(() => {
                        console.log(`Callback executed for Alert ${alertId}.`);
                        AlertModel.triggerAlert(alertId).then(() => {
                            console.log(`Alert ${alertId} triggered.`);
                            if (alertType === 'standard') {
                                AlertModel.deactivateAlert(alertId, "Triggered").then(() => {
                                    console.log(`Alert ${alertId} deactivated.`);
                                    delete subscribers[pair][alertId]; // Cleanup after deactivation for standard alerts
                                });
                            }
                        });
                    });
                }
            }
        });

        ws.on('error', (error) => {
            console.error(`WebSocket error for pair ${pair}:`, error);
            if (error.message.includes('451')) {
                console.error('Error code: 451. Unable to collect data. Accessing Binance from potentially restricted region.');
                // This logs and handles the 451 error specifically
            }
        });
    } else {
        subscribers[pair][alertId] = { targetPrice, direction, callback, triggered: false, alertType, lastNotificationTime: 0 };
    }

}

async function handlePriceUpdate(price, alertId) {
    // This function is for manual price updates and alert deactivations.
    console.log(`Manual price update for alert ${alertId}: ${price}.`);
    try {
        // Deactivate alert after it's been triggered
        await AlertModel.deactivateAlert(alertId);
        console.log(`Alert ${alertId} deactivated.`);
        // This deletes the alert from the subscribers if it exists
        Object.keys(subscribers).forEach((pair) => {
            if (subscribers[pair][alertId]) {
                console.log(`Deleting Alert ${alertId} from subscribers.`);
                delete subscribers[pair][alertId];
            }
        });
    } catch (error) {
        console.error(`Error deactivating alert ${alertId}:`, error);
    }
}



module.exports = { subscribeToPair, handlePriceUpdate };
