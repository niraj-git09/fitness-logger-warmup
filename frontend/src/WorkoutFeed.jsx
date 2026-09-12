import { useState, useEffect } from 'react';

function WorkoutFeed({ workouts: propWorkouts, loading: propLoading, onWorkoutChanged }) {
  const [internalWorkouts, setInternalWorkouts] = useState([]);
  const [internalLoading, setInternalLoading] = useState(true);

  // Track which workout is currently being edited
  const [editingId, setEditingId] = useState(null);
  const [editExercise, setEditExercise] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editDate, setEditDate] = useState('');

  const isControlled = propWorkouts !== undefined;
  const workouts = isControlled ? propWorkouts : internalWorkouts;
  const loading = isControlled ? propLoading : internalLoading;

  const fetchWorkouts = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/workouts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setInternalWorkouts(data);
      } else {
        console.error('Failed to fetch workouts');
      }
    } catch (error) {
      console.error('Server error', error);
    } finally {
      setInternalLoading(false);
    }
  };

  useEffect(() => {
    if (!isControlled) {
      fetchWorkouts();
    }
  }, [isControlled]);

  const notifyChange = () => {
    if (onWorkoutChanged) {
      onWorkoutChanged();
    } else if (!isControlled) {
      fetchWorkouts();
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workout session?')) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/workouts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        notifyChange();
      } else {
        const data = await response.json();
        alert(`❌ Delete failed: ${data.error}`);
      }
    } catch (error) {
      alert('❌ Server connection error while deleting.');
    }
  };

  const startEdit = (workout) => {
    setEditingId(workout.id);
    setEditExercise(workout.exercise_type);
    setEditDuration(workout.duration_minutes);
    setEditDate(formatDate(workout.date_logged));
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/workouts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          exercise_type: editExercise,
          duration_minutes: editDuration,
          date_logged: editDate
        })
      });

      if (response.ok) {
        setEditingId(null);
        notifyChange();
      } else {
        const data = await response.json();
        alert(`❌ Update failed: ${data.error}`);
      }
    } catch (error) {
      alert('❌ Server connection error while updating.');
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '850px', margin: '20px auto', textAlign: 'left' }}>
      <h3 style={{ color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        📋 Workout History
      </h3>
      
      {loading ? (
        <p style={{ color: '#666' }}>Loading your workouts...</p>
      ) : workouts.length === 0 ? (
        <p style={{ color: '#777', fontStyle: 'italic' }}>No workouts logged yet. Get to work!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {workouts.map((workout) => (
            <li 
              key={workout.id} 
              style={{ 
                background: '#ffffff', 
                border: '1px solid #e1e4e8', 
                margin: '12px 0', 
                padding: '16px 20px', 
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
              }}
            >
              {editingId === workout.id ? (
                /* Inline Edit Form */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input 
                      type="text" 
                      value={editExercise} 
                      onChange={(e) => setEditExercise(e.target.value)} 
                      placeholder="Exercise"
                      style={editInputStyle}
                      required
                    />
                    <input 
                      type="number" 
                      value={editDuration} 
                      onChange={(e) => setEditDuration(e.target.value)} 
                      placeholder="Minutes"
                      style={{ ...editInputStyle, width: '100px' }}
                      required
                    />
                    <input 
                      type="date" 
                      value={editDate} 
                      onChange={(e) => setEditDate(e.target.value)} 
                      style={editInputStyle}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                    <button 
                      onClick={() => handleSaveEdit(workout.id)}
                      style={saveBtnStyle}
                    >
                      💾 Save Changes
                    </button>
                    <button 
                      onClick={cancelEdit}
                      style={cancelBtnStyle}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Standard View */
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <strong style={{ fontSize: '16px', color: '#1a1a1a' }}>{workout.exercise_type}</strong>
                    <br />
                    <small style={{ color: '#666' }}>Logged on: {formatDate(workout.date_logged)}</small>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      backgroundColor: '#e7f3ff',
                      color: '#0066cc',
                      fontWeight: 'bold',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '14px'
                    }}>
                      ⏱️ {workout.duration_minutes} mins
                    </span>

                    <button 
                      onClick={() => startEdit(workout)}
                      title="Edit workout"
                      style={actionBtnStyle}
                    >
                      ✏️ Edit
                    </button>

                    <button 
                      onClick={() => handleDelete(workout.id)}
                      title="Delete workout"
                      style={{ ...actionBtnStyle, color: '#dc3545', borderColor: '#f5c6cb' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const editInputStyle = {
  padding: '8px 12px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '14px'
};

const saveBtnStyle = {
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  padding: '6px 14px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

const cancelBtnStyle = {
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  padding: '6px 14px',
  borderRadius: '4px',
  cursor: 'pointer'
};

const actionBtnStyle = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #dee2e6',
  borderRadius: '4px',
  padding: '6px 10px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '500'
};

export default WorkoutFeed;