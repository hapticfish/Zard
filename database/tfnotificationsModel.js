const { pool } = require('./index');

const tfnotificationsModel = {

    async upsertTFNotification(userId, eventType, enabled, warning1, warning2) {
        const client = await pool.connect();
        try {
            await client.query(
                `INSERT INTO user_tf_notifications (user_id, event_type, enabled, warning_1, warning_2, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT (user_id, event_type)
                DO UPDATE SET enabled = $3, warning_1 = $4, warning_2 = $5, updated_at = CURRENT_TIMESTAMP`,
                [userId, eventType, enabled, warning1, warning2]
            );
        } finally {
            client.release();
        }
    },

    async getEnabledNotifications() {
        const client = await pool.connect();
        try {
            const res = await client.query(`SELECT * FROM user_tf_notifications WHERE enabled = TRUE`);
            return res.rows;
        } finally {
            client.release();
        }
    }
};

module.exports = tfnotificationsModel;
