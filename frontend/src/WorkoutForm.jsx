import { useState } from 'react';

const POPULAR_EXERCISES = [
  { name: 'Running', icon: '🏃' },
  { name: 'Weight Training', icon: '🏋️' },
  { name: 'Cycling', icon: '🚴' },
  { name: 'Yoga', icon: '🧘' },
  { name: 'Swimming', icon: '🏊' },
  { name: 'Walking', icon: '🚶' }
];

function WorkoutForm({ onWorkoutAdded }) {
  const today = new Date().toISOString().split('T')[0];
  const [exerciseType, setExerciseType] = useState('');
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState(today);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    
    const token = localStorage.getItem('token'); 

    try {
      const response = await fetch('http://localhost:5000/api/workouts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          exercise_type: exerciseType, 
          duration_minutes: duration,
          date_logged: date
        }),
      });

      if (response.ok) {
        setStatusMessage({ type: 'success', text: '✅ Session logged securely!' });
        setExerciseType('');
        setDuration('');
        setDate(today);
        if (onWorkoutAdded) {
          onWorkoutAdded();
        }
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        const data = await response.json();
        setStatusMessage({ type: 'error', text: `❌ ${data.error || 'Failed to add workout.'}` });
      }
    } catch (error) {
      setStatusMessage({ type: 'error', text: '❌ Server connection error.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '850px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      padding: '24px 28px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      textAlign: 'left'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
          ⚡ Log a Workout Session
        </h3>
        {statusMessage && (
          <span style={{
            fontSize: '13px',
            fontWeight: '600',
            padding: '4px 12px',
            borderRadius: '9999px',
            backgroundColor: statusMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: statusMessage.type === 'success' ? '#065f46' : '#991b1b',
            transition: 'all 0.3s ease'
          }}>
            {statusMessage.text}
          </span>
        )}
      </div>

      {/* Fast Selection Chips */}
      <div style={{ marginBottom: '16px' }}>
        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Quick Select:
        </span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
          {POPULAR_EXERCISES.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => setExerciseType(item.name)}
              style={{
                backgroundColor: exerciseType === item.name ? '#eef2ff' : '#f8fafc',
                border: exerciseType === item.name ? '1px solid #6366f1' : '1px solid #e2e8f0',
                color: exerciseType === item.name ? '#4338ca' : '#475569',
                borderRadius: '9999px',
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {item.icon} {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Inputs */}
      <form onSubmit={handleSubmit} style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) auto',
        gap: '12px',
        alignItems: 'end'
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
            Exercise Name
          </label>
          <input 
            type="text" 
            placeholder="e.g. HIIT, Rowing..." 
            value={exerciseType} 
            onChange={(e) => setExerciseType(e.target.value)} 
            required 
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
            Duration (Minutes)
          </label>
          <input 
            type="number" 
            placeholder="e.g. 45" 
            min="1"
            max="720"
            value={duration} 
            onChange={(e) => setDuration(e.target.value)} 
            required 
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
            Date
          </label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            required 
            style={inputStyle}
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '11px 24px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 4px rgba(79, 70, 229, 0.25)',
            whiteSpace: 'nowrap'
          }}
        >
          {isSubmitting ? 'Saving...' : '💾 Log Session'}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #cbd5e1',
  borderRadius: '10px',
  fontSize: '14px',
  backgroundColor: '#ffffff'
};

export default WorkoutForm;