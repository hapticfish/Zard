const { Pool } = require('pg');

// Initialize a connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Additional configurations as necessary, such as SSL
});

pool.query('SELECT NOW()', (err, res) => {
    console.log(err, res);
});

// Listen for app termination / restart events
const onProcessExit = async () => {
    console.log('Application is shutting down. Closing database connection pool...');
    await pool.end(); // Close the PostgreSQL connection pool
    process.exit(0); // Exit the process after the pool has closed
};

// For normal app termination
process.on('SIGINT', onProcessExit); // Catch CTRL+C
process.on('SIGTERM', onProcessExit); // Catch kill

// For nodemon restarts
process.once('SIGUSR2', async () => {
    await onProcessExit();
    process.kill(process.pid, 'SIGUSR2'); // Send SIGUSR2 to current process
});

module.exports = { pool };


//TODO continue with running powershell admin for pg_dump for back up ('GPT currency conversion')
//TODO schedule regular back ops with windows task scheduler
//TODO follow guide for connecting App to PostgreSQL with SSL ('GPT currncy conversion')
