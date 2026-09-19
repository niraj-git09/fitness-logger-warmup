import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { calculateTotalCalories } from './utils/calorieUtils';

function WorkoutCharts({ workouts = [], hideSummaryCards = false }) {
  const [chartView, setChartView] = useState('both'); // 'both', 'trend', 'activity'

  if (!workouts || workouts.length === 0) {
    return (
      <div style={{
        width: '100%',
        padding: '36px 24px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '16px',
        border: '2px dashed var(--border-color)',
        textAlign: 'center',
        transition: 'background-color 0.3s ease, border-color 0.3s ease'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
        <h3 style={{ color: 'var(--text-main)', fontSize: '18px', fontWeight: '700', margin: '0 0 6px 0' }}>
          Workout Analytics
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
          No session data recorded yet. Log your first workout to visualize your progress!
        </p>
      </div>
    );
  }

  // 1. Calculate Summary Stats
  const totalMinutes = workouts.reduce((sum, w) => sum + Number(w.duration_minutes || 0), 0);
  const totalSessions = workouts.length;
  const avgDuration = Math.round(totalMinutes / totalSessions);
  const totalCalories = calculateTotalCalories(workouts);

  // 2. Timeline Data: sorted chronologically
  const timelineData = [...workouts]
    .sort((a, b) => new Date(a.date_logged) - new Date(b.date_logged))
    .map(w => ({
      date: (w.date_logged || '').split('T')[0],
      duration: Number(w.duration_minutes),
      exercise: w.exercise_type
    }));

  // 3. Category Data: aggregated by exercise type
  const categoryMap = {};
  workouts.forEach(w => {
    const type = w.exercise_type || 'Other';
    if (!categoryMap[type]) {
      categoryMap[type] = { exercise: type, totalMinutes: 0, sessions: 0 };
    }
    categoryMap[type].totalMinutes += Number(w.duration_minutes || 0);
    categoryMap[type].sessions += 1;
  });
  const categoryData = Object.values(categoryMap);

  return (
    <div style={{
      width: '100%',
      backgroundColor: 'var(--bg-card)',
      borderRadius: '16px',
      border: '1px solid var(--border-color)',
      padding: '24px 26px',
      boxShadow: 'var(--shadow-sm)',
      boxSizing: 'border-box',
      textAlign: 'left',
      transition: 'background-color 0.3s ease, border-color 0.3s ease'
    }}>
      {/* Quick Summary Cards (shown if not handled by top dashboard bar) */}
      {!hideSummaryCards && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div style={statCardStyle}>
            <div style={statNumberStyle}>{totalSessions}</div>
            <div style={statLabelStyle}>Total Sessions</div>
          </div>
          <div style={statCardStyle}>
            <div style={statNumberStyle}>{totalMinutes} <span style={{ fontSize: '16px', fontWeight: '600' }}>mins</span></div>
            <div style={statLabelStyle}>Total Active Time</div>
          </div>
          <div style={statCardStyle}>
            <div style={statNumberStyle}>{avgDuration} <span style={{ fontSize: '16px', fontWeight: '600' }}>mins</span></div>
            <div style={statLabelStyle}>Average Session</div>
          </div>
          <div style={statCardStyle}>
            <div style={{ ...statNumberStyle, color: 'var(--warning)' }}>
              🔥 {totalCalories.toLocaleString()} <span style={{ fontSize: '16px', fontWeight: '600' }}>kcal</span>
            </div>
            <div style={statLabelStyle}>Est. Calories Burned</div>
          </div>
        </div>
      )}

      {/* Unified Card Header with View Switcher */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>📈</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>
              Workout Analytics
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Duration trends and activity distribution
            </span>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-card-subtle)',
          borderRadius: '10px',
          padding: '3px',
          border: '1px solid var(--border-color)',
          gap: '3px'
        }}>
          <button
            type="button"
            onClick={() => setChartView('trend')}
            style={{
              background: chartView === 'trend' ? 'var(--primary)' : 'transparent',
              color: chartView === 'trend' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '7px',
              padding: '5px 11px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            📈 Trend
          </button>
          <button
            type="button"
            onClick={() => setChartView('activity')}
            style={{
              background: chartView === 'activity' ? 'var(--primary)' : 'transparent',
              color: chartView === 'activity' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '7px',
              padding: '5px 11px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            🏋️ Activity
          </button>
          <button
            type="button"
            onClick={() => setChartView('both')}
            style={{
              background: chartView === 'both' ? 'var(--primary)' : 'transparent',
              color: chartView === 'both' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '7px',
              padding: '5px 11px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            ⊞ Both
          </button>
        </div>
      </div>

      {/* Charts Display Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: chartView === 'both' ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr',
        gap: '20px'
      }}>
        {/* Timeline Chart */}
        {(chartView === 'both' || chartView === 'trend') && (
          <div style={{
            backgroundColor: 'var(--bg-app)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            padding: '16px 14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', paddingLeft: '4px' }}>
              <span style={{ fontSize: '15px' }}>📈</span>
              <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '14px', fontWeight: '700' }}>
                Duration History (Minutes)
              </h4>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                  formatter={(value) => [`${value} mins`, 'Duration']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line 
                  type="monotone" 
                  dataKey="duration" 
                  name="Duration (mins)" 
                  stroke="var(--primary)" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: 'var(--primary)' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Exercise Distribution Chart */}
        {(chartView === 'both' || chartView === 'activity') && (
          <div style={{
            backgroundColor: 'var(--bg-app)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            padding: '16px 14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', paddingLeft: '4px' }}>
              <span style={{ fontSize: '15px' }}>🏋️</span>
              <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '14px', fontWeight: '700' }}>
                Minutes by Activity
              </h4>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="exercise" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                  formatter={(value) => [`${value} mins`, 'Total Time']}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar 
                  dataKey="totalMinutes" 
                  name="Total Minutes" 
                  fill="var(--success)" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

const statCardStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: '16px',
  padding: '20px',
  boxShadow: 'var(--shadow-sm)',
  textAlign: 'center',
  transition: 'background-color 0.3s ease, border-color 0.3s ease'
};

const statNumberStyle = {
  fontSize: '26px',
  fontWeight: '800',
  color: 'var(--primary)',
  marginBottom: '4px',
  letterSpacing: '-0.5px'
};

const statLabelStyle = {
  fontSize: '12px',
  fontWeight: '600',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const chartContainerStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: '16px',
  padding: '22px',
  boxShadow: 'var(--shadow-sm)',
  transition: 'background-color 0.3s ease, border-color 0.3s ease'
};

export default WorkoutCharts;
