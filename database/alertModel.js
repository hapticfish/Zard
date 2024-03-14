const { pool } = require('./index');

const AlertModel = {
    async addAlert(userId, cryptoPair, targetPrice, direction) {
        const query = `
            INSERT INTO alerts (user_id, crypto_pair, target_price, direction, active)
            VALUES ($1, $2, $3, $4, true)
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

    async deactivateAlert(alertId) {
        const query = `UPDATE alerts SET active = FALSE WHERE id = $1;`;
        try {
            await pool.query(query, [alertId]);
        } catch (err) {
            console.error('Error deactivating alert:', err);
            throw err;
        }
    }
};

module.exports = AlertModel;
