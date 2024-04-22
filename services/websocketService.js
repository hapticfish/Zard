const WebSocket = require('ws');
const AlertModel = require('../database/alertModel');
const { createFlexibleAlertCallback } = require('../utils/callbackFactory');
const {formatPairForAllExchanges} = require("../utils/currencyUtils");
const { handleCoinbaseMessage } = require('../utils/websocketUtils');
const { calculateReconnectDelay } = require('../utils/websocketUtils');
const subscribers = {};
const webSockets = {};
let reconnectAttempts = {};  // To keep track of reconnect attempts per pair

let AlertlastLogTime = 0; // Timestamp of the last log for rate-limited logging
let priceExtractionLLogTime = 0;
const logInterval = 4000; // Log interval in milliseconds (4 seconds)
const notificationCooldown = 480000; // 8 minutes cooldown for notifications
const priceThresholdPercentage = 0.0001475; // 0.01475% threshold for price difference

function subscribeToPair(pair, alertId, targetPrice, direction, alertType, callback) {
    console.log(`Subscribing to pair: ${pair} with alertId: ${alertId}, targetPrice: ${targetPrice}, direction: ${direction}, type: ${alertType}`);

    // Define the URLs for the WebSocket connections for both exchanges
    const BINANCE_WS_URL = `wss://stream.binance.com:9443/ws/`;
    const COINBASE_WS_URL = `wss://ws-feed.exchange.coinbase.com`;


    if (typeof callback !== 'function') {
        throw new Error('Callback must be a function.');
    }

    if (!webSockets[pair]) {
        webSockets[pair] = createWebSocketConnection(pair, 'binance');
    }

    subscribers[pair] = subscribers[pair] || {};
    subscribers[pair][alertId] = { targetPrice, direction, callback, alertType, lastNotificationTime: 0 };

/*handle processing spesific pair by exchange rules
* make a funciton for */


    function createWebSocketConnection(pair, platform) {
        const formattedPairs = formatPairForAllExchanges(pair);
        let url = platform === 'binance' ? `${BINANCE_WS_URL}${formattedPairs.BINANCE.toLowerCase()}@trade` : `${COINBASE_WS_URL}`;
        const ws = new WebSocket(url);

        ws.on('open', () => {
            console.log(`Connected to WebSocket for pair ${pair} on ${platform}.`);
            if (platform === 'coinbase') {
                const subscribeMessage = {
                    "type": "subscribe",
                    "product_ids": [formattedPairs.COINBASE],
                    channels: ["ticker", "heartbeat"]
                };
                ws.send(JSON.stringify(subscribeMessage));
            }
        });
        ws.on('message', (data) => handleMessage(data, pair, platform));
        ws.on('close', (code, reason) => {
            console.log(`Connection closed for ${pair} on ${platform}. Code: ${code}, Reason: ${reason}`);
            delete webSockets[pair];  // Always delete reference on close
            if (platform === 'binance' && String(code).includes('451') || String(code).includes('1006')) {
                console.log(`No reconnection attempt due to Binance 451 error for ${pair}.`);
            } else {
                handleReconnection(pair, platform, code);
            }
        });
        ws.on('error', (error) =>{
            console.error(`WebSocket error for ${pair} on ${platform}:`, error);
            if (platform === 'binance' && String(error.message).includes('451') || String(code).includes('1006')) {
                console.log(`No reconnection attempt due to Binance 451 error for ${pair}.`);
            }
            handleWebSocketError(error, pair, platform);
        });

        return ws;
    }

    function shouldReconnect(pair, code, platform) {
        const MAX_RECONNECT_ATTEMPTS = 5;
        const isReconnectCode = (code) => ![1000, 1006, 'ErrSlowConsume', 'ErrSlowRead', 'Message too big'].includes(code); // Add other codes as necessary

        if(platform === 'binance' && code === 451 || code === 1006){
            console.log(`Binance 451 error should not reconnect to binance.`)
            return false;
        }


        if (!reconnectAttempts[pair]) reconnectAttempts[pair] = 0;
        if (reconnectAttempts[pair] >= MAX_RECONNECT_ATTEMPTS) {
            console.error(`Max reconnect attempts reached for ${pair}.`);
            return false;
        }

        setTimeout(() => {
            console.log(`Attempting reconnect to ${platform} for ${pair}.`);
            webSockets[pair] = createWebSocketConnection(pair, platform);
        }, calculateReconnectDelay(reconnectAttempts[pair]));

        return true;
    }

    function handleReconnection(pair, platform, code) {
        if (platform === 'binance' && code === 451 || code === 1006) {
            console.log(`Skipping reconnection to Binance for ${pair} due to 451 error.`);
            return;
        }

        console.log(`Reconnection Code ${code}`)
        if (shouldReconnect(pair, platform, code)) {
            console.log(`Preparing to reconnect to WebSocket for ${pair} on ${platform}.`);
            const delay = calculateReconnectDelay(reconnectAttempts[pair]);  // Calculate the delay
            setTimeout(() => {
                console.log(`Reconnecting to WebSocket for ${pair} on ${platform} (Attempt: ${reconnectAttempts[pair] + 1})`);
                reconnectAttempts[pair] = (reconnectAttempts[pair] || 0) + 1;  // Increment reconnect attempts
                webSockets[pair] = createWebSocketConnection(pair, platform);  // Attempt reconnection
            }, delay);
        } else {
            console.log(`No reconnection attempt for ${pair} on ${platform} due to code: ${code}`);
        }
    }

    function handleWebSocketError(error, pair, platform) {
        console.error(`WebSocket error for pair ${pair} on ${platform}:`, error);
        if (error.message.includes('451') || error.message.includes('1006')) {
            console.error('Switching to Coinbase due to region restrictions on Binance.');
            webSockets[pair] = createWebSocketConnection(pair, 'coinbase');
        }else {
            handleReconnection(pair, platform);
        }
    }
}

async function handleMessage(data, pair, platform) {
    const currentTime = Date.now();
    const currentTimeHR = new Date(currentTime).toLocaleString();
    // console.log(`Raw data received from ${platform}: ${data}`);  // Log the raw data for debugging
    let priceFloat;

    try {
        const info = JSON.parse(data);
        // console.log(`Parsed data from ${platform}:`, info);  // Log parsed data

        // Different handling based on the platform due to different data structures
        if (platform === 'coinbase') {
            if (info.type === 'ticker' && info.price) {
                priceFloat = parseFloat(info.price);
                if(currentTime - priceExtractionLLogTime > logInterval && priceFloat !== undefined){
                    console.log(`Coinbase price extracted: ${priceFloat} ${currentTimeHR}`);  // Log successful price extraction
                    priceExtractionLLogTime = currentTime;  // Update last logged time
                }
            }else {
                handleCoinbaseMessage(info, currentTime);

            }
        } else if (platform === 'binance' && info.p) {
            priceFloat = parseFloat(info.p);
            if(currentTime - priceExtractionLLogTime > logInterval && priceFloat !== undefined){
                console.log(`Binance price extracted: ${priceFloat} ${currentTimeHR} `);
                priceExtractionLLogTime = currentTime;  // Update last logged time
            }
        }else{
            console.log(`No price information in binance ticker message:`, info);

        }

        // Log active alerts if the current time is right
        if (currentTime - AlertlastLogTime > logInterval && subscribers[pair]) {
            logActiveAlerts(pair, priceFloat, platform);
            AlertlastLogTime = currentTime;
        }

        // Use map for promises to handle each alert asynchronously
        const alertPromises = Object.keys(subscribers[pair]).map(async (alertId) => {
            const alertDetails = subscribers[pair][alertId];
            if (!alertDetails){
                console.log(`No alert details found for alert ID: ${alertId}`);
                return null; // handle empty cases
            }

            const status = await AlertModel.fetchAlertStatus(alertId);
            // console.log(`Status fetched for alert ${alertId}: ${status}`);
            if (!subscribers[pair] || !subscribers[pair][alertId] || status !== 'Active' && status !== 'Triggered') {
                console.log(`Alert ${alertId} is not active or triggered (status: ${status}). Skipping.`);
                delete subscribers[pair][alertId];
                return null; // case w/ no alert
            }

            return evaluateAlert(pair, alertId, priceFloat, alertDetails, status);
        });

        // Wait for all Promises to resolve
        await Promise.all(alertPromises);

    } catch (error) {
        console.error(`Failed to parse message from ${platform}:`, error);
    }
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



function logActiveAlerts(pair, currentPrice, platform) {
    if(platform === 'coinbase' && currentPrice !== undefined){
        console.log(`Received trade data for ${pair}: Current price = ${currentPrice}`);
    }else if (platform ==='binance'){
        console.log(`Received trade data for ${pair}: Current price = ${currentPrice}`);
    }
    console.log(`Checking alerts for ${pair}`);
    Object.entries(subscribers[pair]).forEach(([alertId, { targetPrice, direction, alertType }]) => {
        console.log(`Alert ID: ${alertId}, Target price: ${targetPrice}, Direction: ${direction}, Type: ${alertType}`);
    });
}

async function initAlerts() {
    try {
        const activeAlerts = await AlertModel.getAllActiveAlerts(); // Ensure this method is correctly implemented in AlertModel
        activeAlerts.forEach(alert => {
            subscribeToPair(alert.crypto_pair, alert.id, alert.target_price, alert.direction, alert.alert_type, createFlexibleAlertCallback({
                formattedPair: alert.crypto_pair,
                targetPrice: alert.target_price,
                direction: alert.direction,
                alertType: alert.alert_type
                // No message object passed; maybe log or handle alerts differently
            }));
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
