import { useState } from 'react';

function WorkoutForm() {
  const [exerciseType, setExerciseType] = useState('');
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Grab the VIP wristband from the browser's memory
    const token = localStorage.getItem('token'); 

    try {
      const response = await fetch('http://localhost:5000/api/workouts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // 2. Show the token to the backend bouncer!
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          exercise_type: exerciseType, 
          duration_minutes: duration,
          date_logged: date
        }),
      });

      if (response.ok) {
        alert('✅ Workout added securely!');
        setExerciseType('');
        setDuration('');
        setDate('');
      } else {
        const data = await response.json();
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      alert('❌ Server connection error.');
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px 0', borderRadius: '8px' }}>
      <h3>Log a Session</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <input 
          type="text" 
          placeholder="Exercise (e.g. Run)" 
          value={exerciseType} 
          onChange={(e) => setExerciseType(e.target.value)} 
          required 
        />
        <input 
          type="number" 
          placeholder="Minutes" 
          value={duration} 
          onChange={(e) => setDuration(e.target.value)} 
          required 
        />
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          required 
        />
        <button type="submit" style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px' }}>
          Save
        </button>
      </form>
    </div>
  );
}

export default WorkoutForm;