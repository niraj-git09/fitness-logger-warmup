import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import GoalTracker from './GoalTracker';
import WorkoutForm from './WorkoutForm';
import WorkoutCharts from './WorkoutCharts';
import WorkoutFeed from './WorkoutFeed';

function Dashboard() {
  const [workouts, setWorkouts] = useState([]);
  const [profile, setProfile] = useState(null);
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

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        console.error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Profile fetch error', error);
    }
  };

  useEffect(() => {
    fetchWorkouts();
    fetchProfile();
  }, []);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px 20px 60px' }}>
      <Navbar profile={profile} />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Weekly Goal Progress */}
        <GoalTracker 
          workouts={workouts} 
          profile={profile} 
          onProfileUpdated={fetchProfile} 
        />

        {/* Workout Input Form */}
        <WorkoutForm onWorkoutAdded={fetchWorkouts} />

        {/* Analytics & Charts */}
        <WorkoutCharts workouts={workouts} />

        {/* History Feed with Edit/Delete */}
        <WorkoutFeed 
          workouts={workouts} 
          loading={loading} 
          onWorkoutChanged={fetchWorkouts} 
        />
      </div>
    </div>
  );
}

export default Dashboard;
