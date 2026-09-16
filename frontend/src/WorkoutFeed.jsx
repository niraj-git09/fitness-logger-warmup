import { useState, useEffect, useMemo } from 'react';
import { calculateCalories } from './utils/calorieUtils';

const CATEGORIES = ['All', 'Running', 'Weight Training', 'Cycling', 'Yoga', 'Swimming', 'Walking'];

function WorkoutFeed({ workouts: propWorkouts, loading: propLoading, onWorkoutChanged }) {
  const [internalWorkouts, setInternalWorkouts] = useState([]);
  const [internalLoading, setInternalLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'week', 'month'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'duration_desc', 'duration_asc'

  // Inline edit states
  const [editingId, setEditingId] = useState(null);
  const [editExercise, setEditExercise] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editDate, setEditDate] = useState('');

  const isControlled = propWorkouts !== undefined;
  const rawWorkouts = isControlled ? propWorkouts : internalWorkouts;
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

  // Filter and Sort Workouts
  const filteredWorkouts = useMemo(() => {
    let result = [...rawWorkouts];

    // 1. Text Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(w => (w.exercise_type || '').toLowerCase().includes(q));
    }

    // 2. Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter(w => {
        const type = (w.exercise_type || '').toLowerCase();
        return type.includes(selectedCategory.toLowerCase());
      });
    }

    // 3. Time Filter
    if (timeFilter !== 'all') {
      const now = new Date();
      if (timeFilter === 'week') {
        const dayOfWeek = now.getDay();
        const diffToMonday = (dayOfWeek + 6) % 7;
        const monday = new Date(now);
        monday.setDate(now.getDate() - diffToMonday);
        monday.setHours(0, 0, 0, 0);

        result = result.filter(w => new Date(w.date_logged) >= monday);
      } else if (timeFilter === 'month') {
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        result = result.filter(w => new Date(w.date_logged) >= firstDayOfMonth);
      }
    }

    // 4. Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date_logged) - new Date(a.date_logged);
      if (sortBy === 'oldest') return new Date(a.date_logged) - new Date(b.date_logged);
      if (sortBy === 'duration_desc') return Number(b.duration_minutes) - Number(a.duration_minutes);
      if (sortBy === 'duration_asc') return Number(a.duration_minutes) - Number(b.duration_minutes);
      return 0;
    });

    return result;
  }, [rawWorkouts, searchQuery, selectedCategory, timeFilter, sortBy]);

  const hasActiveFilters = searchQuery || selectedCategory !== 'All' || timeFilter !== 'all' || sortBy !== 'newest';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setTimeFilter('all');
    setSortBy('newest');
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
    <div style={{ width: '100%', maxWidth: '850px', margin: '0 auto', textAlign: 'left' }}>
      {/* Feed Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>📋</span>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>
            Workout History
          </h3>
          <span style={{
            fontSize: '12px',
            backgroundColor: 'var(--bg-card-subtle)',
            color: 'var(--text-muted)',
            padding: '2px 8px',
            borderRadius: '9999px',
            fontWeight: '600'
          }}>
            {filteredWorkouts.length}
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>🔄</span> Clear Filters
          </button>
        )}
      </div>

      {/* Interactive Controls & Filters Card */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Search Bar & Dropdowns Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
          {/* Live Search Input */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: 'var(--text-muted)' }}>
              🔍
            </span>
            <input 
              type="text"
              placeholder="Search exercise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '13px',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Time Range Filter */}
          <div>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="all">📅 All Dates</option>
              <option value="week">📅 This Week</option>
              <option value="month">📅 This Month</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={selectStyle}
            >
              <option value="newest">⏱️ Newest First</option>
              <option value="oldest">⏱️ Oldest First</option>
              <option value="duration_desc">⚡ Longest Duration</option>
              <option value="duration_asc">⚡ Shortest Duration</option>
            </select>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginRight: '4px' }}>
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-card-subtle)',
                color: selectedCategory === cat ? '#ffffff' : 'var(--text-muted)',
                border: selectedCategory === cat ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
          Loading your workouts...
        </div>
      ) : filteredWorkouts.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px dashed var(--border-color)',
          borderRadius: '16px',
          padding: '40px 20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '30px', marginBottom: '8px' }}>🔍</div>
          <h4 style={{ margin: '0 0 6px', color: 'var(--text-main)', fontSize: '16px' }}>
            {hasActiveFilters ? 'No workouts match your filters' : 'No workouts logged yet'}
          </h4>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>
            {hasActiveFilters 
              ? 'Try resetting your search query or selecting a different category.' 
              : 'Log your first workout to get your fitness journey started!'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              style={{
                marginTop: '12px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '7px 16px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredWorkouts.map((workout) => (
            <li 
              key={workout.id} 
              style={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border-color)', 
                padding: '16px 20px', 
                borderRadius: '14px',
                boxShadow: 'var(--shadow-sm)',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
            >
              {editingId === workout.id ? (
                /* Inline Edit Mode */
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
                /* Standard Card View */
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <strong style={{ fontSize: '16px', color: 'var(--text-main)' }}>{workout.exercise_type}</strong>
                    <br />
                    <small style={{ color: 'var(--text-muted)' }}>Logged on: {formatDate(workout.date_logged)}</small>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      fontWeight: '700',
                      padding: '5px 12px',
                      borderRadius: '9999px',
                      fontSize: '13px'
                    }}>
                      ⏱️ {workout.duration_minutes} mins
                    </span>

                    <span style={{
                      backgroundColor: 'var(--warning-light)',
                      color: 'var(--warning-text)',
                      fontWeight: '700',
                      padding: '5px 12px',
                      borderRadius: '9999px',
                      fontSize: '13px'
                    }}>
                      🔥 {calculateCalories(workout.exercise_type, workout.duration_minutes)} kcal
                    </span>

                    <button 
                      onClick={() => startEdit(workout)}
                      title="Edit workout session"
                      style={actionBtnStyle}
                    >
                      ✏️ Edit
                    </button>

                    <button 
                      onClick={() => handleDelete(workout.id)}
                      title="Delete workout session"
                      style={{ ...actionBtnStyle, color: 'var(--danger)', borderColor: 'var(--danger-light)' }}
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

const selectStyle = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  fontSize: '13px',
  backgroundColor: 'var(--bg-card)',
  color: 'var(--text-main)',
  cursor: 'pointer'
};

const editInputStyle = {
  padding: '8px 12px',
  border: '1px solid var(--border-color)',
  borderRadius: '6px',
  fontSize: '14px',
  backgroundColor: 'var(--bg-card)',
  color: 'var(--text-main)'
};

const saveBtnStyle = {
  backgroundColor: 'var(--success)',
  color: '#ffffff',
  border: 'none',
  padding: '6px 14px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '13px'
};

const cancelBtnStyle = {
  backgroundColor: 'var(--bg-card-subtle)',
  color: 'var(--text-muted)',
  border: '1px solid var(--border-color)',
  padding: '6px 14px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px'
};

const actionBtnStyle = {
  backgroundColor: 'var(--bg-card-subtle)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  padding: '6px 10px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '500',
  color: 'var(--text-main)'
};

export default WorkoutFeed;