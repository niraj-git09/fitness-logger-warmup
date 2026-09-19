import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import GoalTracker from './GoalTracker';
import WorkoutForm from './WorkoutForm';
import WorkoutCharts from './WorkoutCharts';
import WorkoutFeed from './WorkoutFeed';
import StreakTracker from './StreakTracker';
import Achievements from './Achievements';
import WeeklyReportModal from './WeeklyReportModal';
import FitnessCalculator from './FitnessCalculator';
import { calculateTotalCalories } from './utils/calorieUtils';

function Dashboard() {
  const [workouts, setWorkouts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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

  // Executive KPI summary metrics
  const totalSessions = workouts.length;
  const totalMinutes = workouts.reduce((sum, w) => sum + Number(w.duration_minutes || 0), 0);
  const avgDuration = totalSessions ? Math.round(totalMinutes / totalSessions) : 0;
  const totalCalories = calculateTotalCalories(workouts);

  return (
    <div className="dashboard-container">
      <Navbar profile={profile} onOpenLogModal={openLogModal} />
      
      {/* Top Banner Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px',
        padding: '0 4px',
        textAlign: 'left'
      }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Welcome back, {displayName} 👋
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
            Real-time workout analytics, weekly targets, and consistency metrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsReportModalOpen(true)}
            style={{
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '12px 18px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{ fontSize: '16px' }}>📊</span>
            <span>Performance Report</span>
          </button>

          <button
            onClick={openLogModal}
            style={{
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 22px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
          >
            <span style={{ fontSize: '16px' }}>➕</span>
            <span>Log Workout</span>
          </button>
        </div>
      </div>

      {/* Executive KPI Summary Cards */}
      <div className="kpi-grid">
        <div style={kpiCardStyle}>
          <div style={{ ...kpiIconStyle, backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            🏋️
          </div>
          <div>
            <div style={kpiValueStyle}>{totalSessions}</div>
            <div style={kpiLabelStyle}>Total Sessions</div>
          </div>
        </div>

        <div style={kpiCardStyle}>
          <div style={{ ...kpiIconStyle, backgroundColor: 'var(--success-light)', color: 'var(--success-text)' }}>
            ⏱️
          </div>
          <div>
            <div style={kpiValueStyle}>
              {totalMinutes} <span style={{ fontSize: '14px', fontWeight: '600' }}>m</span>
            </div>
            <div style={kpiLabelStyle}>Total Active Time</div>
          </div>
        </div>

        <div style={kpiCardStyle}>
          <div style={{ ...kpiIconStyle, backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            ⚡
          </div>
          <div>
            <div style={kpiValueStyle}>
              {avgDuration} <span style={{ fontSize: '14px', fontWeight: '600' }}>m</span>
            </div>
            <div style={kpiLabelStyle}>Average Session</div>
          </div>
        </div>

        <div style={kpiCardStyle}>
          <div style={{ ...kpiIconStyle, backgroundColor: 'var(--warning-light)', color: 'var(--warning-text)' }}>
            🔥
          </div>
          <div>
            <div style={kpiValueStyle}>
              {totalCalories.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: '600' }}>kcal</span>
            </div>
            <div style={kpiLabelStyle}>Est. Calories Burned</div>
          </div>
        </div>
      </div>

      {/* Section 1: Weekly Habits & Consistency (Balanced 50% / 50% Row) */}
      <div style={{ marginBottom: '32px' }}>
        <div className="dashboard-section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🎯</span>
            <h2 className="dashboard-section-title">Weekly Goals & Consistency</h2>
          </div>
          <span className="dashboard-section-subtitle">Active minute targets and 7-day habit discipline</span>
        </div>

        <div className="dashboard-habits-grid">
          <GoalTracker 
            workouts={workouts} 
            profile={profile} 
            onProfileUpdated={fetchProfile} 
          />
          <StreakTracker workouts={workouts} />
        </div>
      </div>

      {/* Section 2: Main Workspace (Balanced 60% Activity/Analytics vs 40% Athlete Hub) */}
      <div>
        <div className="dashboard-section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>⚡</span>
            <h2 className="dashboard-section-title">Training Activity & Tools</h2>
          </div>
          <span className="dashboard-section-subtitle">Performance analytics, session logs, and personal benchmarks</span>
        </div>

        <div className="dashboard-main-grid">
          {/* Left Column (Main Focus): Visual Analytics & Workout Feed */}
          <div className="dashboard-col-main">
            {/* Unified Charts & Graphs with View Switcher */}
            <WorkoutCharts workouts={workouts} hideSummaryCards={true} />

            {/* History Feed with Live Search, Filters, Sort, Notes, Edit, and Delete */}
            <WorkoutFeed 
              workouts={workouts} 
              loading={loading} 
              onWorkoutChanged={fetchWorkouts} 
            />
          </div>

          {/* Right Column (Sidebar Hub): Milestone Badges & Biometrics Calculators */}
          <div className="dashboard-col-side">
            {/* Milestone Badges & Achievements */}
            <Achievements workouts={workouts} profile={profile} />

            {/* Health & Body Metrics Calculators */}
            <FitnessCalculator />
          </div>
        </div>
      </div>

      {/* Modal Popup for Logging Workouts */}
      {isLogModalOpen && (
        <WorkoutForm 
          isModal={true} 
          onClose={closeLogModal} 
          onWorkoutAdded={fetchWorkouts} 
        />
      )}

      {/* Modal Popup for Weekly Performance Report */}
      {isReportModalOpen && (
        <WeeklyReportModal
          workouts={workouts}
          profile={profile}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}
    </div>
  );
}

const kpiCardStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: '16px',
  padding: '18px 20px',
  boxShadow: 'var(--shadow-sm)',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  textAlign: 'left',
  transition: 'background-color 0.3s ease, border-color 0.3s ease'
};

const kpiIconStyle = {
  width: '46px',
  height: '46px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '22px',
  flexShrink: 0
};

const kpiValueStyle = {
  fontSize: '24px',
  fontWeight: '800',
  color: 'var(--text-main)',
  letterSpacing: '-0.5px',
  lineHeight: '1.2'
};

const kpiLabelStyle = {
  fontSize: '11px',
  fontWeight: '700',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginTop: '2px'
};

export default Dashboard;
