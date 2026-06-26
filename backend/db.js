const mysql = require('mysql2');

// Configure the connection to your local MySQL server
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Mysql@1234', 
    database: 'fitness_db'
});

// Test the connection
db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed: ' + err.stack);
        return;
    }
    console.log('✅ Connected to MySQL fitness_db successfully.');
});

// Export it so server.js can use it
module.exports = db;