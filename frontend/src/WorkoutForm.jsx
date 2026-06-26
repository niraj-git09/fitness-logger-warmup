import { useState } from 'react';

function WorkoutForm() {
  // 1. Set up React State to remember what the user types
  const [exercise, setExercise] = useState('');
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState('');

  // 2. The function that runs when you hit "Submit"
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the browser page from refreshing

    // Package the state into an object that matches our MySQL database columns
    const workoutData = {
      exercise_type: exercise,
      duration_minutes: duration,
      date_logged: date
    };

    try {
      // Send the POST request to our Node.js server
      const response = await fetch('http://localhost:5000/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workoutData),
      });

      if (response.ok) {
        alert('✅ Workout added to database successfully!');
        // Clear the form fields after a successful save
        setExercise('');
        setDuration('');
        setDate('');
      } else {
        alert('❌ Failed to add workout.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Server connection error.');
    }
  };

  // 3. The actual visual HTML/JSX of the form
  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', maxWidth: '400px', marginBottom: '20px' }}>
      <h2>Log a New Workout</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Exercise Type:</label>
          <select value={exercise} onChange={(e) => setExercise(e.target.value)} required style={{ width: '100%', padding: '8px' }}>
            <option value="" disabled>Select an exercise</option>
            <option value="Morning Run">Morning Run</option>
            <option value="Dumbbells">Dumbbells</option>
            <option value="Cycling">Cycling</option>
            <option value="Yoga">Yoga</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Duration (minutes):</label>
          <input 
            type="number" 
            value={duration} 
            onChange={(e) => setDuration(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Date:</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Submit Workout
        </button>
        
      </form>
    </div>
  );
}

export default WorkoutForm;