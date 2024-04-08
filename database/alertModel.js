const { pool } = require('./index');

const AlertModel = {
    async addAlert(userId, cryptoPair, targetPrice, direction, alertType = 'standard') {
        console.log(`Attempting to add alert: User ID=${userId}, Pair=${cryptoPair}`);
        const query = `
        INSERT INTO alerts (user_id, crypto_pair, target_price, direction, alert_type, creation_date, status)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, 'Active')
        RETURNING *;`;
        const values = [userId, cryptoPair, targetPrice, direction, alertType];

        console.log(`Attempting to add alert: User ID=${userId}, Pair=${cryptoPair}, Price=${targetPrice}, Direction=${direction}`);
        try {
            const { rows } = await pool.query(query, values);
            console.log('Alert added successfully:', rows[0]);
            return rows[0];
        } catch (err) {
            console.error('Error adding alert to database:', err.message);
            throw err;
        }
    },

    async triggerAlert(alertId) {
        console.log(`Triggering alert: Alert ID=${alertId}`);
        const query = `
            UPDATE alerts
            SET last_triggered = CURRENT_TIMESTAMP, 
                trigger_count = trigger_count + 1, 
                status = 'Triggered'
            WHERE id = $1
            RETURNING *;`;
        try {
            const { rows } = await pool.query(query, [alertId]);
            console.log('Alert triggered successfully:', rows[0]);
            return rows[0];
        } catch (err) {
            console.error('Error triggering alert in database:', err.message);
            throw err;
        }
    },

    async deactivateAlert(alertId, reason = 'Condition met') {
        console.log(`Deactivating alert: Alert ID=${alertId}, Reason=${reason}`);
        const query = `
            UPDATE alerts
            SET status = 'Deactivated', 
                deactivation_reason = $2,
                deletion_date = CURRENT_TIMESTAMP
            WHERE id = $1;`;
        try {
            await pool.query(query, [alertId, reason]);
            console.log(`Alert ID=${alertId} deactivated successfully.`);
        } catch (err) {
            console.error('Error deactivating alert:', err.message);
            throw err;
        }
    },

    async getActiveAlerts(userId) {
        console.log(`Retrieving active alerts for User ID=${userId}`);
        const query = `SELECT id, crypto_pair, target_price, direction, status, creation_date, alert_type FROM alerts WHERE user_id = $1 AND status = 'Active'`;
        try {
            const { rows } = await pool.query(query, [userId]);
            console.log('Active alerts retrieved successfully');
            return rows;
        } catch (err) {
            console.error('Error retrieving active alerts from database:', err.message);
            throw err;
        }
    },

    async verifyAlertOwnership(userId, alertId) {
        const query = `
        SELECT 1
        FROM alerts
        WHERE id = $1 AND user_id = $2;
    `;
        try {
            const { rows } = await pool.query(query, [alertId, userId]);
            return rows.length > 0; // Returns true if the alert exists and belongs to the user, false otherwise
        } catch (err) {
            console.error('Error verifying alert ownership:', err);
            throw err; // Re-throw the error or handle it as needed
        }
    },

    async fetchAlertStatus(alertId) {
        const query = `SELECT status FROM alerts WHERE id = $1;`;
        try {
            const { rows } = await pool.query(query, [alertId]);
            if (rows.length > 0) {
                return rows[0].status;
            }
            return 'Deleted'; // Return deleted if the alert doesn't exist or has been deleted.
        } catch (err) {
            console.error(`Error fetching status for alert ${alertId}:`, err.message);
            return 'Error'; // Return null or an appropriate value that indicates an error.
        }
    },

    async reactivateAlert(alertId) {
        const query = `
            UPDATE alerts
            SET status = 'Active', last_triggered = NULL
            WHERE id = $1 AND status = 'Triggered';`;
        try {
            await pool.query(query, [alertId]);
            console.log(`Alert ${alertId} reactivated successfully.`);
        } catch (err) {
            console.error(`Error reactivating alert ${alertId}:`, err.message);
            throw err;
        }
    }

};

module.exports = AlertModel;
