import { useState } from 'react';

function GoalTracker({ workouts = [], profile, onProfileUpdated }) {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [targetMinutes, setTargetMinutes] = useState(profile?.weekly_goal_minutes || 150);
  const [isSaving, setIsSaving] = useState(false);

  const goal = profile?.weekly_goal_minutes || 150;

  // Calculate current week range (Monday to Sunday)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday...
  const diffToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // Filter workouts belonging to this calendar week
  const thisWeekWorkouts = workouts.filter((w) => {
    if (!w.date_logged) return false;
    const wDate = new Date(w.date_logged);
    return wDate >= monday && wDate <= sunday;
  });

  const weeklyMinutes = thisWeekWorkouts.reduce(
    (acc, w) => acc + Number(w.duration_minutes || 0),
    0
  );

  const percentage = Math.min(100, Math.round((weeklyMinutes / goal) * 100));
  const remaining = Math.max(0, goal - weeklyMinutes);

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    if (targetMinutes <= 0) return;

    setIsSaving(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ weekly_goal_minutes: Number(targetMinutes) })
      });

      if (response.ok) {
        setIsEditingGoal(false);
        if (onProfileUpdated) {
          onProfileUpdated();
        }
      } else {
        const data = await response.json();
        alert(`❌ Could not update goal: ${data.error}`);
      }
    } catch (err) {
      alert('❌ Server connection error.');
    } finally {
      setIsSaving(false);
    }
  };

  // Get status badge styling
  let badgeText = `🎯 ${remaining} mins to reach goal`;
  let badgeBg = 'var(--primary-light)';
  let badgeColor = 'var(--primary)';

  if (percentage >= 100) {
    badgeText = '🏆 Weekly Goal Crushed!';
    badgeBg = 'var(--success-light)';
    badgeColor = 'var(--success-text)';
  } else if (percentage >= 75) {
    badgeText = '⚡ Almost there! Final push!';
    badgeBg = 'var(--success-light)';
    badgeColor = 'var(--success-text)';
  } else if (percentage >= 50) {
    badgeText = '🔥 Halfway mark reached!';
    badgeBg = 'var(--warning-light)';
    badgeColor = 'var(--warning-text)';
  }

  return (
    <div style={{
      width: '100%',
      backgroundColor: 'var(--bg-card)',
      borderRadius: '16px',
      border: '1px solid var(--border-color)',
      padding: '24px 28px',
      boxShadow: 'var(--shadow-sm)',
      textAlign: 'left',
      transition: 'background-color 0.3s ease, border-color 0.3s ease'
    }}>
      {/* Top Header Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🎯</span>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>
              Weekly Fitness Target
            </h3>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {monday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – {sunday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            backgroundColor: badgeBg,
            color: badgeColor,
            fontWeight: '600',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '13px'
          }}>
            {badgeText}
          </span>

          <button
            onClick={() => {
              setTargetMinutes(goal);
              setIsEditingGoal(!isEditingGoal);
            }}
            style={{
              backgroundColor: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '13px',
              color: 'var(--text-main)',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            {isEditingGoal ? 'Cancel' : '⚙️ Adjust Target'}
          </button>
        </div>
      </div>

      {/* Inline Goal Editor */}
      {isEditingGoal && (
        <form onSubmit={handleSaveGoal} style={{
          backgroundColor: 'var(--bg-card-subtle)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
            Set Target Minutes:
          </label>
          <input
            type="number"
            min="10"
            max="1440"
            value={targetMinutes}
            onChange={(e) => setTargetMinutes(e.target.value)}
            style={{
              padding: '6px 12px',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              width: '100px',
              fontSize: '14px',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-main)'
            }}
            required
          />
          <button
            type="submit"
            disabled={isSaving}
            style={{
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 16px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: isSaving ? 'not-allowed' : 'pointer'
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <small style={{ color: 'var(--text-muted)' }}>
            (WHO guidelines suggest 150+ minutes of aerobic activity per week)
          </small>
        </form>
      )}

      {/* Progress Stats Numbers */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
        <div>
          <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)' }}>
            {weeklyMinutes}
          </span>
          <span style={{ fontSize: '16px', color: 'var(--text-muted)', marginLeft: '4px' }}>
            / {goal} mins
          </span>
        </div>
        <span style={{ fontSize: '18px', fontWeight: '700', color: percentage >= 100 ? 'var(--success)' : 'var(--primary)' }}>
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '14px',
        backgroundColor: 'var(--bg-card-subtle)',
        border: '1px solid var(--border-color)',
        borderRadius: '9999px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: percentage >= 100
            ? 'linear-gradient(90deg, #10b981, #059669)'
            : 'linear-gradient(90deg, #6366f1, #4f46e5)',
          borderRadius: '9999px',
          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
        }} />
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '10px',
        fontSize: '12px',
        color: 'var(--text-light)'
      }}>
        <span>{thisWeekWorkouts.length} session{thisWeekWorkouts.length === 1 ? '' : 's'} logged this week</span>
        <span>{remaining === 0 ? 'Goal completed! 🌟' : `${remaining} mins to 100%`}</span>
      </div>
    </div>
  );
}

export default GoalTracker;
