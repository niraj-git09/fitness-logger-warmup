import { useState, useEffect } from 'react';

function WorkoutFeed() {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      // Grab the VIP wristband
      const token = localStorage.getItem('token');

      try {
        const response = await fetch('http://localhost:5000/api/workouts', {
          headers: {
            // Show the token to fetch your specific data
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setWorkouts(data);
        } else {
          console.error("Failed to fetch workouts");
        }
      } catch (error) {
        console.error("Server error", error);
      }
    };

    fetchWorkouts();
  }, []);

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'left' }}>
      <h3>Your History</h3>
      {workouts.length === 0 ? (
        <p>No workouts logged yet. Get to work!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {workouts.map((workout) => (
            <li key={workout.id} style={{ background: '#f4f4f4', margin: '10px 0', padding: '15px', borderRadius: '5px' }}>
              <strong>{workout.exercise_type}</strong> - {workout.duration_minutes} mins 
              <br />
              <small style={{ color: '#666' }}>Logged on: {workout.date_logged.split('T')[0]}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default WorkoutFeed;