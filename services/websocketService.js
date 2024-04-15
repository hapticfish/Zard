const WebSocket = require('ws');
const AlertModel = require('../database/alertModel');

const subscribers = {};
const webSockets = {};

let lastLogTime = 0; // Timestamp of the last log for rate-limited logging
const logInterval = 4000; // Log interval in milliseconds (4 seconds)
const notificationCooldown = 480000; // 8 minutes cooldown for notifications
const priceThresholdPercentage = 0.0001475; // 0.01475% threshold for price difference

function subscribeToPair(pair, alertId, targetPrice, direction, alertType, callback) {
    console.log(`Subscribing to pair: ${pair} with alertId: ${alertId}, targetPrice: ${targetPrice}, direction: ${direction}, type: ${alertType}`);

    if (typeof callback !== 'function') {
        throw new Error('Callback must be a function.');
    }

    // Initialize subscription for the pair if it doesn't exist
    if (!webSockets[pair]) {

        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${pair.toLowerCase()}@trade`);
        ws.on('open', () => console.log(`Connected to WebSocket for pair ${pair}.`));
        ws.on('message', (data) => handleMessage(data, pair));
        ws.on('close', () => { delete webSockets[pair]; });
        ws.on('error', (error) => handleWebSocketError(error, pair));
        webSockets[pair] = ws;
    }
    // Add or update the alert in the subscribers object
    subscribers[pair] = subscribers[pair] || {};
    subscribers[pair][alertId] = {targetPrice, direction, callback, alertType, lastNotificationTime: 0};
}

async function handleMessage(data, pair) {
    const currentTime = Date.now();
    const { p: price } = JSON.parse(data);
    const priceFloat = parseFloat(price);

    if (currentTime - lastLogTime > logInterval && subscribers[pair]) {
        logActiveAlerts(pair, priceFloat);
        lastLogTime = currentTime;
    }

    // Using map for promises
    const alertPromises = Object.keys(subscribers[pair]).map(async (alertId) => {
        const alertDetails = subscribers[pair][alertId];
        if (!alertDetails) return null; // handle empty cases

        const status = await AlertModel.fetchAlertStatus(alertId);
        if (!subscribers[pair] || !subscribers[pair][alertId] || status !== 'Active' && status !== 'Triggered') {
            console.log(`Alert ${alertId} is not active or triggered (status: ${status}). Skipping.`);
            delete subscribers[pair][alertId];
            return null; // case w/ no alert
        }

        return evaluateAlert(pair, alertId, priceFloat, alertDetails, status);
    });

    // Wait for all Promises to resolve
    await Promise.all(alertPromises);
}

async function evaluateAlert(pair, alertId, priceFloat, alertDetails, status) {
    const { targetPrice, direction, alertType, callback, lastNotificationTime } = alertDetails;
    const isWithinThreshold = Math.abs(priceFloat - targetPrice) / targetPrice <= priceThresholdPercentage;
    const timeSinceLastNotification = Date.now() - lastNotificationTime;
    const shouldNotify = timeSinceLastNotification >= notificationCooldown || alertType === 'standard';

    const conditionMet = (direction === 'above' && priceFloat > targetPrice) || (direction === 'below' && priceFloat < targetPrice);
    if (conditionMet && shouldNotify && isWithinThreshold) {
        console.log(`Alert ${alertId} condition met. Price: ${priceFloat}`);
        alertDetails.lastNotificationTime = Date.now(); // Update notification time
        await callback(priceFloat, alertId); // Execute the callback function

        // If standard alert, deactivate it
        if (alertType === 'standard') {
            await AlertModel.deactivateAlert(alertId);
            console.log(`Standard alert ${alertId} deactivated.`);
            delete subscribers[pair][alertId];
        } else if (alertType === 'perpetual' && status === 'Triggered') {
            // Reactivate perpetual alert if previously triggered
            await AlertModel.reactivateAlert(alertId);
            console.log(`Perpetual alert ${alertId} reactivated.`);
        }

        await AlertModel.triggerAlert(alertId); // Mark the alert as triggered in the database
    }
}

function handleWebSocketError(error, pair) {
    console.error(`WebSocket error for pair ${pair}:`, error);
    if (error.message.includes('451')) {
        console.error('Error code: 451. Unable to collect data. Accessing Binance from potentially restricted region.');
    }
}

function logActiveAlerts(pair, currentPrice) {
    console.log(`Received trade data for ${pair}: price = ${currentPrice}`);
    console.log(`Checking alerts for ${pair}. Current price: ${currentPrice}`);
    Object.entries(subscribers[pair]).forEach(([alertId, { targetPrice, direction, alertType }]) => {
        console.log(`Alert ID: ${alertId}, Target price: ${targetPrice}, Direction: ${direction}, Type: ${alertType}`);
    });
}

async function initAlerts() {
    try {
        const activeAlerts = await AlertModel.getAllActiveAlerts();
        activeAlerts.forEach(alert => {
            subscribeToPair(alert.crypto_pair, alert.id, alert.target_price, alert.direction, alert.alert_type, alertCallback);
        });
        console.log('Alerts initialized successfully.');
    } catch (error) {
        console.error('Failed to initialize alerts:', error);
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



module.exports = { subscribeToPair, initAlerts, handlePriceUpdate };
