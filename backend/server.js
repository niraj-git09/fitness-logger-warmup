const express = require('express');
const cors = require('cors');
const db = require('./db'); // Imports the database connection you just built

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. SETUP & GLOBAL MIDDLEWARE
// ==========================================
app.use(cors()); // Security feature to allow frontend requests
app.use(express.json()); // Allows your server to read incoming JSON data

// A quick test route to verify the server is listening
app.get('/', (req, res) => {
    res.send('FitCheck API is running!');
});

// ==========================================
// 2. PUBLIC AUTHENTICATION ROUTES
// ==========================================

// POST Route: Register a new user
app.post('/api/register', async (req, res) => {
    const { email, password, name } = req.body;
    
    try {
        // Scramble the password using bcrypt (10 rounds of hashing)
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Save the new user to the database
        const sql = 'INSERT INTO users (email, password, name) VALUES (?, ?, ?)';
        
        db.query(sql, [email, hashedPassword, name || null], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Email already in use' });
                }
                console.error('❌ Error saving user:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: '✅ User registered successfully!' });
        });
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST Route: Login a user
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user in the database by their email
        const sql = 'SELECT * FROM users WHERE email = ?';
        db.query(sql, [email], async (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            
            // Check if the user exists
            if (results.length === 0) {
                return res.status(400).json({ error: 'User not found' });
            }

            const user = results[0];

            // Compare the typed password with the hashed password in the DB
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            // Create the JWT "VIP Wristband"
            const token = jwt.sign({ userId: user.id }, 'my_super_secret_key', { expiresIn: '1h' });

            res.json({ 
                message: '✅ Login successful!', 
                token: token 
            });
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==========================================
// 3. SECURITY MIDDLEWARE (THE BOUNCER)
// ==========================================

// Middleware: Verify JWT Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No VIP wristband.' });
    }

    jwt.verify(token, 'my_super_secret_key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token.' });
        }
        req.user = user; 
        next(); 
    });
};

// ==========================================
// 4. PROTECTED API ROUTES
// ==========================================

// GET Route: Fetch logged-in user's profile and goal settings
app.get('/api/user/profile', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const sql = 'SELECT id, email, name, weekly_goal_minutes, created_at FROM users WHERE id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('❌ Error fetching profile:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(results[0]);
    });
});

// PUT Route: Update user profile and weekly goal
app.put('/api/user/profile', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { name, weekly_goal_minutes } = req.body;

    const sql = 'UPDATE users SET name = COALESCE(?, name), weekly_goal_minutes = COALESCE(?, weekly_goal_minutes) WHERE id = ?';
    db.query(sql, [name, weekly_goal_minutes, userId], (err, result) => {
        if (err) {
            console.error('❌ Error updating profile:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: '✅ Profile updated successfully!' });
    });
});

// GET Route: Fetch ONLY the logged-in user's past workouts
app.get('/api/workouts', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    
    // Notice the WHERE clause linking the workout to the specific user!
    const sql = 'SELECT * FROM workouts WHERE user_id = ? ORDER BY date_logged DESC';
    
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('❌ Error fetching workouts:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// POST Route: Save a new workout tied to the logged-in user
app.post('/api/workouts', authenticateToken, (req, res) => {
    const { exercise_type, duration_minutes, date_logged, notes, intensity } = req.body;
    const userId = req.user.userId; 
    
    const validIntensity = ['low', 'medium', 'high'].includes((intensity || '').toLowerCase())
        ? intensity.toLowerCase()
        : 'medium';
    const notesValue = notes && typeof notes === 'string' && notes.trim() !== '' ? notes.trim() : null;

    const sql = 'INSERT INTO workouts (exercise_type, duration_minutes, date_logged, notes, intensity, user_id) VALUES (?, ?, ?, ?, ?, ?)';
    
    db.query(sql, [exercise_type, duration_minutes, date_logged, notesValue, validIntensity, userId], (err, result) => {
        if (err) {
            console.error('❌ Error saving workout:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ 
            message: '✅ Workout added securely!', 
            workoutId: result.insertId 
        });
    });
});

// DELETE Route: Delete a workout (verifying ownership)
app.delete('/api/workouts/:id', authenticateToken, (req, res) => {
    const workoutId = req.params.id;
    const userId = req.user.userId;

    const sql = 'DELETE FROM workouts WHERE id = ? AND user_id = ?';
    db.query(sql, [workoutId, userId], (err, result) => {
        if (err) {
            console.error('❌ Error deleting workout:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Workout not found or unauthorized' });
        }
        res.json({ message: '✅ Workout deleted successfully!' });
    });
});

// PUT Route: Update a workout (verifying ownership)
app.put('/api/workouts/:id', authenticateToken, (req, res) => {
    const workoutId = req.params.id;
    const userId = req.user.userId;
    const { exercise_type, duration_minutes, date_logged, notes, intensity } = req.body;

    const validIntensity = intensity && ['low', 'medium', 'high'].includes(intensity.toLowerCase())
        ? intensity.toLowerCase()
        : 'medium';
    const notesValue = notes && typeof notes === 'string' && notes.trim() !== '' ? notes.trim() : null;

    const sql = 'UPDATE workouts SET exercise_type = ?, duration_minutes = ?, date_logged = ?, notes = ?, intensity = ? WHERE id = ? AND user_id = ?';
    db.query(sql, [exercise_type, duration_minutes, date_logged, notesValue, validIntensity, workoutId, userId], (err, result) => {
        if (err) {
            console.error('❌ Error updating workout:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Workout not found or unauthorized' });
        }
        res.json({ message: '✅ Workout updated successfully!' });
    });
});

// ==========================================
// 5. SERVER START
// ==========================================
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});