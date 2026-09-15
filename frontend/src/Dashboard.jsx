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
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

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

  const openLogModal = () => setIsLogModalOpen(true);
  const closeLogModal = () => setIsLogModalOpen(false);

  const displayName = profile?.name || (profile?.email ? profile.email.split('@')[0] : 'Athlete');

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px 20px 80px' }}>
      <Navbar profile={profile} onOpenLogModal={openLogModal} />
      
      {/* Top Banner Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px',
        padding: '0 4px'
      }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Welcome back, {displayName} 👋
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
            Track your sessions, monitor weekly targets, and review performance trends.
          </p>
        </div>

        <button
          onClick={openLogModal}
          style={{
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}
        >
          <span style={{ fontSize: '16px' }}>➕</span>
          <span>Log Workout</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Weekly Goal Progress */}
        <GoalTracker 
          workouts={workouts} 
          profile={profile} 
          onProfileUpdated={fetchProfile} 
        />

        {/* Analytics & Charts */}
        <WorkoutCharts workouts={workouts} />

        {/* History Feed with Live Search, Filters, Sort, Edit, and Delete */}
        <WorkoutFeed 
          workouts={workouts} 
          loading={loading} 
          onWorkoutChanged={fetchWorkouts} 
        />
      </div>

      {/* Modal Popup for Logging Workouts */}
      {isLogModalOpen && (
        <WorkoutForm 
          isModal={true} 
          onClose={closeLogModal} 
          onWorkoutAdded={fetchWorkouts} 
        />
      )}
    </div>
  );
}

export default Dashboard;
