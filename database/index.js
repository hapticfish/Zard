const { Pool } = require('pg');

// Initialize a connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Additional configurations as necessary, such as SSL
});

pool.query('SELECT NOW()', (err, res) => {
    console.log(err, res);
    pool.end();
});

module.exports = { pool };


//TODO continue with running powershell admin for pg_dump for back up ('GPT currency conversion')
//TODO schedule regular back ops with windows task scheduler
//TODO follow guide for connecting App to PostgreSQL with SSL ('GPT currncy conversion')
