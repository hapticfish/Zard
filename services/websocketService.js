// websocketService.js in the services directory
const WebSocket = require('ws');
const AlertModel = require('../database/alertModel'); // Adjust path as necessary

const subscribers = {};

function subscribeToPair(pair, alertId, callback) {
    // Initialize subscription for the pair if it doesn't exist
    if (!subscribers[pair]) {
        subscribers[pair] = {};
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${pair.toLowerCase()}@trade`);
        ws.on('message', (message) => {
            const { p: price } = JSON.parse(message);
            Object.keys(subscribers[pair]).forEach((id) => {
                subscribers[pair][id](price);
            });
        });
    }

    // Register the callback for this alert
    subscribers[pair][alertId] = async (price) => {
        await callback(price, alertId);
    };
}

async function handlePriceUpdate(price, alertId) {
    // This function would be called by the WebSocket message event listener
    try {
        // Assuming price comparison logic happens within callback provided to subscribeToPair
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
