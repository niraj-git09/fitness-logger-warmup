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
        padding: '30px',
        margin: '20px 0',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px dashed #ccc',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#555', margin: '0 0 10px 0' }}>📊 Workout Analytics</h3>
        <p style={{ color: '#777', margin: 0 }}>
          No workout data to visualize yet. Log a session above to see your progress charts!
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
    <div style={{ width: '100%', maxWidth: '850px', margin: '20px auto' }}>
      {/* Quick Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '15px',
        marginBottom: '25px'
      }}>
        <div style={statCardStyle}>
          <div style={statNumberStyle}>{totalSessions}</div>
          <div style={statLabelStyle}>Total Sessions</div>
        </div>
        <div style={statCardStyle}>
          <div style={statNumberStyle}>{totalMinutes} min</div>
          <div style={statLabelStyle}>Total Time</div>
        </div>
        <div style={statCardStyle}>
          <div style={statNumberStyle}>{avgDuration} min</div>
          <div style={statLabelStyle}>Avg Duration</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: '20px'
      }}>
        {/* Timeline Chart */}
        <div style={chartContainerStyle}>
          <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>📈 Duration Over Time (Mins)</h4>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 12 }} />
              <YAxis stroke="#666" tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value) => [`${value} mins`, 'Duration']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="duration" 
                name="Duration (mins)" 
                stroke="#007bff" 
                strokeWidth={3} 
                dot={{ r: 5, fill: '#007bff' }} 
                activeDot={{ r: 7 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Exercise Distribution Chart */}
        <div style={chartContainerStyle}>
          <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>🏋️ Minutes by Exercise Type</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="exercise" stroke="#666" tick={{ fontSize: 12 }} />
              <YAxis stroke="#666" tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value) => [`${value} mins`, 'Total Time']}
              />
              <Legend />
              <Bar 
                dataKey="totalMinutes" 
                name="Total Minutes" 
                fill="#28a745" 
                radius={[4, 4, 0, 0]} 
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
  border: '1px solid #e1e4e8',
  borderRadius: '8px',
  padding: '15px 20px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
  textAlign: 'center'
};

const statNumberStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#007bff',
  marginBottom: '5px'
};

const statLabelStyle = {
  fontSize: '13px',
  color: '#666',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const chartContainerStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e1e4e8',
  borderRadius: '8px',
  padding: '20px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
};

export default WorkoutCharts;
