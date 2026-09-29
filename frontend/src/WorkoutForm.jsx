import { useState, useEffect } from 'react';

const POPULAR_EXERCISES = [
  { name: 'Running', icon: '🏃' },
  { name: 'Weight Training', icon: '🏋️' },
  { name: 'Cycling', icon: '🚴' },
  { name: 'Yoga', icon: '🧘' },
  { name: 'Swimming', icon: '🏊' },
  { name: 'Walking', icon: '🚶' }
];

const ROUTINE_PRESETS = [
  { label: '30m Run', exercise: 'Running', duration: 30, intensity: 'high', icon: '🏃' },
  { label: '45m Strength', exercise: 'Weight Training', duration: 45, intensity: 'medium', icon: '🏋️' },
  { label: '25m Cycling', exercise: 'Cycling', duration: 25, intensity: 'high', icon: '🚴' },
  { label: '20m Yoga', exercise: 'Yoga', duration: 20, intensity: 'low', icon: '🧘' },
  { label: '30m Brisk Walk', exercise: 'Walking', duration: 30, intensity: 'low', icon: '🚶' },
  { label: '40m Swim', exercise: 'Swimming', duration: 40, intensity: 'high', icon: '🏊' }
];

function WorkoutForm({ onWorkoutAdded, isModal = false, onClose, initialData = null }) {
  const today = new Date().toISOString().split('T')[0];
  const [exerciseType, setExerciseType] = useState(initialData?.exercise_type || '');
  const [duration, setDuration] = useState(initialData?.duration_minutes ? String(initialData.duration_minutes) : '');
  const [date, setDate] = useState(initialData?.date_logged ? initialData.date_logged.split('T')[0] : today);
  const [intensity, setIntensity] = useState(initialData?.intensity || 'medium');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [statusMessage, setStatusMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync form if initialData prop changes
  useEffect(() => {
    if (initialData) {
      setExerciseType(initialData.exercise_type || '');
      setDuration(initialData.duration_minutes ? String(initialData.duration_minutes) : '');
      setIntensity(initialData.intensity || 'medium');
      setNotes(initialData.notes || '');
      setDate(today);
    }
  }, [initialData, today]);

  const handleApplyPreset = (preset) => {
    setExerciseType(preset.exercise);
    setDuration(String(preset.duration));
    setIntensity(preset.intensity);
  };

  // Close modal on Escape key
  useEffect(() => {
    if (!isModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModal, onClose]);

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
          date_logged: date,
          intensity: intensity,
          notes: notes
        }),
      });

      if (response.ok) {
        setStatusMessage({ type: 'success', text: '✅ Session logged securely!' });
        setExerciseType('');
        setDuration('');
        setDate(today);
        setIntensity('medium');
        setNotes('');

        if (onWorkoutAdded) {
          onWorkoutAdded();
        }

        // Auto-close modal after brief visual confirmation
        if (isModal && onClose) {
          setTimeout(() => {
            onClose();
          }, 600);
        } else {
          setTimeout(() => setStatusMessage(null), 3000);
        }
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

  const formContent = (
    <div 
      className={isModal ? 'modal-card' : ''}
      style={{
        width: '100%',
        maxWidth: isModal ? '560px' : '850px',
        margin: '0 auto',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        padding: '24px 28px',
        boxShadow: isModal ? 'var(--shadow-xl)' : 'var(--shadow-md)',
        textAlign: 'left',
        position: 'relative'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>⚡</span>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>
            Log a Workout Session
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {statusMessage && (
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              padding: '4px 10px',
              borderRadius: '9999px',
              backgroundColor: statusMessage.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
              color: statusMessage.type === 'success' ? 'var(--success-text)' : 'var(--danger-text)'
            }}>
              {statusMessage.text}
            </span>
          )}

          {isModal && onClose && (
            <button
              onClick={onClose}
              type="button"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '6px'
              }}
              title="Close modal (Esc)"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Pre-fill Notice Banner if re-logging */}
      {initialData && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--primary-light)',
          border: '1px solid var(--primary)',
          borderRadius: '10px',
          padding: '8px 12px',
          marginBottom: '16px',
          fontSize: '12px',
          color: 'var(--primary)',
          fontWeight: '600'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🔁</span> Pre-filled from your previous session (Date set to today)
          </span>
          <button
            type="button"
            onClick={() => {
              setExerciseType('');
              setDuration('');
              setIntensity('medium');
              setNotes('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Reset
          </button>
        </div>
      )}

      {/* 1-Click Quick Routine Presets */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span>⚡</span> Quick Routine Presets:
          </span>
          <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600' }}>
            1-Click Fast Fill
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {ROUTINE_PRESETS.map((preset) => {
            const isSelected = exerciseType.toLowerCase() === preset.exercise.toLowerCase() && 
                               duration === String(preset.duration) && 
                               intensity === preset.intensity;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                title={`Auto-fill: ${preset.exercise}, ${preset.duration} mins, ${preset.intensity} intensity`}
                style={{
                  backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-card-subtle)',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  color: isSelected ? '#ffffff' : 'var(--text-main)',
                  borderRadius: '10px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 0 10px rgba(59, 130, 246, 0.3)' : 'none'
                }}
              >
                <span>{preset.icon}</span>
                <span>{preset.label}</span>
                <span style={{
                  fontSize: '10px',
                  opacity: isSelected ? 0.9 : 0.65,
                  padding: '1px 5px',
                  borderRadius: '4px',
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'var(--bg-card)'
                }}>
                  {preset.intensity === 'high' ? 'High' : preset.intensity === 'low' ? 'Low' : 'Mod'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity Type Quick Select Chips */}
      <div style={{ marginBottom: '16px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Or Select Activity Type:
        </span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
          {POPULAR_EXERCISES.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => setExerciseType(item.name)}
              style={{
                backgroundColor: exerciseType === item.name ? 'var(--primary-light)' : 'var(--bg-card-subtle)',
                border: exerciseType === item.name ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                color: exerciseType === item.name ? 'var(--primary)' : 'var(--text-muted)',
                borderRadius: '9999px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {item.icon} {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} style={{
        display: 'grid',
        gridTemplateColumns: isModal ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr)) auto',
        gap: '14px',
        alignItems: 'end'
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Exercise Type
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
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
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
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
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

        {/* Workout Intensity Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Intensity Level
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { value: 'low', label: '🟢 Low', sub: 'Easy / Recovery' },
              { value: 'medium', label: '🟡 Moderate', sub: 'Steady Pace' },
              { value: 'high', label: '🔴 High', sub: 'Peak Effort' }
            ].map((lvl) => (
              <button
                key={lvl.value}
                type="button"
                onClick={() => setIntensity(lvl.value)}
                style={{
                  flex: 1,
                  padding: '7px 8px',
                  borderRadius: '8px',
                  border: intensity === lvl.value ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: intensity === lvl.value ? 'var(--primary-light)' : 'var(--bg-card-subtle)',
                  color: intensity === lvl.value ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: intensity === lvl.value ? '700' : '500',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{lvl.label}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{lvl.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Session Notes Input */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Session Notes (Optional)
          </label>
          <input 
            type="text" 
            placeholder="e.g. 5 sets of bench press, felt energized, 5km PR!" 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: isModal ? '10px' : '0' }}>
          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{
              flex: 1,
              backgroundColor: 'var(--primary)',
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
            {isSubmitting ? 'Saving...' : '💾 Save Session'}
          </button>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: 'var(--bg-card-subtle)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '11px 18px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );

  if (isModal) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        {formContent}
      </div>
    );
  }

  return formContent;
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid var(--border-color)',
  borderRadius: '10px',
  fontSize: '14px',
  color: 'var(--text-main)',
  backgroundColor: 'var(--bg-card)'
};

export default WorkoutForm;