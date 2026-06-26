import { useState, useEffect } from 'react';

function WorkoutFeed() {
  // 1. State to hold the array of workouts we get from the database
  const [workouts, setWorkouts] = useState([]);

  // 2. Function to fetch the data from our Node.js GET route
  const fetchWorkouts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/workouts');
      if (response.ok) {
        const data = await response.json();
        setWorkouts(data); // Save the data into our state
      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  // 3. useEffect tells React to run this fetch function as soon as the component loads
  useEffect(() => {
    fetchWorkouts();
  }, []);

  // 4. The visual UI mapping over the array of workouts
  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
      <h2>Workout History</h2>
      
      {workouts.length === 0 ? (
        <p>No workouts logged yet. Get to work!</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {workouts.map((workout) => (
            <li key={workout.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
              <strong style={{ color: '#007bff' }}>{workout.exercise_type}</strong> - {workout.duration_minutes} mins 
              <br />
              <small style={{ color: '#666' }}>
                {new Date(workout.date_logged).toLocaleDateString()}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default WorkoutFeed;