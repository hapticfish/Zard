const { pool } = require('./index');

const AlertModel = {
    async addAlert(userId, cryptoPair, targetPrice, direction) {
        const query = `
            INSERT INTO alerts (user_id, crypto_pair, target_price, direction, creation_date, status)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, 'Active')
            RETURNING *;`;
        const values = [userId, cryptoPair, targetPrice, direction];

        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (err) {
            console.error('Error adding alert to database:', err);
            throw err;
        }
    },

    async triggerAlert(alertId) {
        const query = `
            UPDATE alerts
            SET last_triggered = CURRENT_TIMESTAMP, 
                trigger_count = trigger_count + 1, 
                status = 'Triggered'
            WHERE id = $1
            RETURNING *;`;
        try {
            const { rows } = await pool.query(query, [alertId]);
            return rows[0];
        } catch (err) {
            console.error('Error triggering alert in database:', err);
            throw err;
        }
    },

    async deactivateAlert(alertId, reason = 'Condition met') {
        const query = `
            UPDATE alerts
            SET status = 'Deactivated', 
                deactivation_reason = $2,
                deletion_date = CURRENT_TIMESTAMP
            WHERE id = $1;`;
        try {
            await pool.query(query, [alertId, reason]);
        } catch (err) {
            console.error('Error deactivating alert:', err);
            throw err;
        }
    }
};

module.exports = AlertModel;
