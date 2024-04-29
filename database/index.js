const { Pool } = require('pg');

// Initialize a connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10, // Lower number of maximum connections
    idleTimeoutMillis: 60000, // Longer idle time, close idle clients after 60 seconds
    connectionTimeoutMillis: 5000, // Longer connection establishment timeout
    // Additional configurations as necessary, such as SSL
});

const metadataPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 30, // Higher number of connections to handle frequent writes
    idleTimeoutMillis: 10000, // Shorter idle timeout, close idle clients after 10 seconds
    connectionTimeoutMillis: 2000, // Quick failure on connection establishment
    // Additional configurations as necessary, such as SSL
}) //do we need a new database URL for metadatapool?

pool.query('SELECT NOW()', (err, res) => {
    console.log(err, res);
});

// Listen for app termination / restart events
const onProcessExit = async () => {
    console.log('Application is shutting down. Closing database connection pools...');
    await Promise.all([pool.end(),metadataPool.end()]); // Close the PostgreSQL connection pool
    console.log('Database pools closed.');
    process.exit(0); // Exit the process after the pool has closed
};

// For normal app termination
process.on('SIGINT', onProcessExit); // Catch CTRL+C
process.on('SIGTERM', onProcessExit); // Catch kill

// For nodemon restarts
process.on('SIGUSR2',async  () => {
    await onProcessExit();
    process.kill(process.pid, 'SIGUSR2');
})

module.exports = { pool, metadataPool };


//TODO continue with running powershell admin for pg_dump for back up ('GPT currency conversion')
//TODO schedule regular back ops with windows task scheduler
//TODO follow guide for connecting App to PostgreSQL with SSL ('GPT currncy conversion')
