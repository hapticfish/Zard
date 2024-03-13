// Require the necessary library
const { Pool } = require('pg');

// Create a pool instance with connection details
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Additional configuration options as needed
});

// Function to add an alert to the database
async function addAlert(userId, cryptoPair, targetPrice, direction) {
    const query = `
        INSERT INTO alerts (user_id, crypto_pair, target_price, direction, active)
        VALUES ($1, $2, $3, $4, true)
        RETURNING *;`; // Returns the added alert
    const values = [userId, cryptoPair, targetPrice, direction];
    try {
        const { rows } = await pool.query(query, values);
        return rows[0];
    } catch (err) {
        console.error('Error adding alert to database:', err);
        throw err;
    }
}

// Function to deactivate an alert
async function deactivateAlert(alertId) {
    const query = `UPDATE alerts SET active = FALSE WHERE id = $1;`;
    try {
        await pool.query(query, [alertId]);
    } catch (err) {
        console.error('Error deactivating alert:', err);
        throw err;
    }
}

// Export the functions for use in other parts of the application
module.exports = {
    addAlert,
    deactivateAlert,
};
