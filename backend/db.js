const mysql = require('mysql2');
require('dotenv').config();

const poolConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Mysql@1234', 
    database: process.env.DB_NAME || 'fitness_db',
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

if (process.env.DB_SSL === 'true') {
    poolConfig.ssl = { rejectUnauthorized: false };
}

// Create connection pool (auto-reconnects and resilient to cloud idle timeouts)
const db = mysql.createPool(poolConfig);

// Test the connection pool
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed: ' + err.message);
        return;
    }
    console.log(`✅ Connected to MySQL [${process.env.DB_NAME || 'fitness_db'}] at ${process.env.DB_HOST || '127.0.0.1'} successfully.`);
    connection.release();
});

// Export it so server.js can use it
module.exports = db;