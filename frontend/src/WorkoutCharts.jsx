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

function WorkoutCharts({ workouts = [] }) {
  if (!workouts || workouts.length === 0) {
    return (
      <div style={{
        width: '100%',
        maxWidth: '850px',
        padding: '36px 24px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '2px dashed #cbd5e1',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
        <h3 style={{ color: '#1e293b', fontSize: '18px', fontWeight: '700', margin: '0 0 6px 0' }}>
          Workout Analytics
        </h3>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
          No session data recorded yet. Log your first workout above to visualize your progress!
        </p>
      </div>
    );
  }

  // 1. Calculate Summary Stats
  const totalMinutes = workouts.reduce((sum, w) => sum + Number(w.duration_minutes || 0), 0);
  const totalSessions = workouts.length;
  const avgDuration = Math.round(totalMinutes / totalSessions);

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
    <div style={{ width: '100%', maxWidth: '850px', margin: '0 auto' }}>
      {/* Quick Summary Cards */}
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
      </div>

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px'
      }}>
        {/* Timeline Chart */}
        <div style={chartContainerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '18px' }}>📈</span>
            <h4 style={{ margin: 0, color: '#0f172a', fontSize: '16px', fontWeight: '700' }}>
              Duration History (Minutes)
            </h4>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
                formatter={(value) => [`${value} mins`, 'Duration']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line 
                type="monotone" 
                dataKey="duration" 
                name="Duration (mins)" 
                stroke="#4f46e5" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#4f46e5' }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Exercise Distribution Chart */}
        <div style={chartContainerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '18px' }}>🏋️</span>
            <h4 style={{ margin: 0, color: '#0f172a', fontSize: '16px', fontWeight: '700' }}>
              Minutes by Activity
            </h4>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="exercise" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
                formatter={(value) => [`${value} mins`, 'Total Time']}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar 
                dataKey="totalMinutes" 
                name="Total Minutes" 
                fill="#10b981" 
                radius={[6, 6, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

const statCardStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  padding: '20px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  textAlign: 'center'
};

const statNumberStyle = {
  fontSize: '26px',
  fontWeight: '800',
  color: '#4f46e5',
  marginBottom: '4px',
  letterSpacing: '-0.5px'
};

const statLabelStyle = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const chartContainerStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  padding: '22px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
};

export default WorkoutCharts;
