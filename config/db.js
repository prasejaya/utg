const { Pool } = require('pg');

const dbConfig = {
    user: 'postgres',
    host: '172.26.80.55', // Update to your actual database host IP
    database: 'untag',
    password: 's3mbarang123',
    port: 5432, // Update if your Postgres port is different
};

let pool = null;

async function connectToDatabase() {
    if (pool) {
        return pool; 
    }

    pool = new Pool({
        ...dbConfig,
        ssl: false, // Adjust based on your database setup
        connectionTimeoutMillis: 50000 // Reasonable timeout (adjust if needed)
    });

    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        pool.end(); 
        throw err; // Re-throw the error to handle it elsewhere
    });

    return pool;
}

module.exports = connectToDatabase;
