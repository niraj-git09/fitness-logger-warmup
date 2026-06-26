const express = require('express');
const cors = require('cors');
const db = require('./db'); // Imports the database connection you just built

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // Security feature to allow frontend requests
app.use(express.json()); // Allows your server to read incoming JSON data

// A quick test route to verify the server is listening
app.get('/', (req, res) => {
    res.send('Fitness Logger API is running!');
});

// ==========================================
// API ROUTES
// ==========================================

// 1. GET Route: Fetch all past workouts
app.get('/api/workouts', (req, res) => {
    // Write the SQL query
    const sql = 'SELECT * FROM workouts ORDER BY date_logged DESC';
    
    // Execute the query
    db.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Error fetching workouts:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results); // Send the data back to the frontend
    });
});

// 2. POST Route: Save a new workout
app.post('/api/workouts', (req, res) => {
    // Extract the data sent from the frontend
    const { exercise_type, duration_minutes, date_logged } = req.body;
    
    // Write the SQL query (using ? to protect against hackers/SQL injection)
    const sql = 'INSERT INTO workouts (exercise_type, duration_minutes, date_logged) VALUES (?, ?, ?)';
    
    // Execute the query with the actual data
    db.query(sql, [exercise_type, duration_minutes, date_logged], (err, result) => {
        if (err) {
            console.error('❌ Error saving workout:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: '✅ Workout added successfully!', id: result.insertId });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});