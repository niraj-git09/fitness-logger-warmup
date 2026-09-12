import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import WorkoutForm from './WorkoutForm';
import WorkoutCharts from './WorkoutCharts';
import WorkoutFeed from './WorkoutFeed';

function Dashboard() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkouts = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/workouts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWorkouts(data);
      } else {
        console.error('Failed to fetch workouts');
      }
    } catch (error) {
      console.error('Server error', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      <Navbar />
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <WorkoutForm onWorkoutAdded={fetchWorkouts} />
        <WorkoutCharts workouts={workouts} />
        <WorkoutFeed workouts={workouts} loading={loading} onWorkoutChanged={fetchWorkouts} />
      </div>
    </div>
  );
}

export default Dashboard;
