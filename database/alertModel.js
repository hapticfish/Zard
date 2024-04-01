const { pool } = require('./index');

const AlertModel = {
    async addAlert(userId, cryptoPair, targetPrice, direction) {
        const query = `
            INSERT INTO alerts (user_id, crypto_pair, target_price, direction, creation_date, status)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, 'Active')
            RETURNING *;`;
        const values = [userId, cryptoPair, targetPrice, direction];

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
    }
};

module.exports = AlertModel;
