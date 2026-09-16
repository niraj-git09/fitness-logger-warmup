import { useMemo } from 'react';

function StreakTracker({ workouts = [] }) {
  const { currentStreak, longestStreak, weekDays, workedOutToday } = useMemo(() => {
    if (!workouts || workouts.length === 0) {
      return { currentStreak: 0, longestStreak: 0, weekDays: [], workedOutToday: false };
    }

    // Map of date string -> total minutes and exercises
    const dateMap = {};
    workouts.forEach(w => {
      const d = (w.date_logged || '').split('T')[0];
      if (d) {
        if (!dateMap[d]) {
          dateMap[d] = { minutes: 0, exercises: [] };
        }
        dateMap[d].minutes += Number(w.duration_minutes || 0);
        dateMap[d].exercises.push(w.exercise_type);
      }
    });

    const toDateStr = (dateObj) => {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const now = new Date();
    const todayStr = toDateStr(now);

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = toDateStr(yesterday);

    const workedOutToday = Boolean(dateMap[todayStr]);

    // 1. Calculate Current Streak
    let streak = 0;
    let checkDate = new Date(now);

    // If worked out today, start from today. If not, check if worked out yesterday
    if (dateMap[todayStr]) {
      while (dateMap[toDateStr(checkDate)]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    } else if (dateMap[yesterdayStr]) {
      checkDate = new Date(yesterday);
      while (dateMap[toDateStr(checkDate)]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    // 2. Calculate Longest Streak
    const sortedDates = Object.keys(dateMap).sort();
    let maxStreak = 0;
    let tempStreak = 0;
    let prevTime = null;

    sortedDates.forEach(dateStr => {
      const [y, m, d] = dateStr.split('-').map(Number);
      const currentTime = new Date(y, m - 1, d).getTime();

      if (prevTime === null) {
        tempStreak = 1;
      } else {
        const diffDays = Math.round((currentTime - prevTime) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      prevTime = currentTime;
      if (tempStreak > maxStreak) {
        maxStreak = tempStreak;
      }
    });

    // 3. Calculate 7-Day Week Matrix (Monday through Sunday)
    const dayOfWeek = now.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((name, index) => {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + index);
      const dateStr = toDateStr(dayDate);
      const isToday = dateStr === todayStr;
      const data = dateMap[dateStr];

      return {
        name,
        dateStr,
        dayNum: dayDate.getDate(),
        isToday,
        isCompleted: Boolean(data),
        minutes: data ? data.minutes : 0,
        exercises: data ? data.exercises : []
      };
    });

    return {
      currentStreak: streak,
      longestStreak: Math.max(streak, maxStreak),
      weekDays,
      workedOutToday
    };
  }, [workouts]);

  return (
    <div style={{
      width: '100%',
      maxWidth: '850px',
      margin: '0 auto',
      backgroundColor: 'var(--bg-card)',
      borderRadius: '16px',
      border: '1px solid var(--border-color)',
      padding: '22px 28px',
      boxShadow: 'var(--shadow-sm)',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px',
      alignItems: 'center',
      transition: 'background-color 0.3s ease, border-color 0.3s ease'
    }}>
      {/* Left: Streak Counter & Status */}
      <div style={{ textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '24px' }}>🔥</span>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>
            Workout Streak
          </h3>
          {currentStreak > 0 && (
            <span style={{
              backgroundColor: 'var(--warning-light)',
              color: 'var(--warning-text)',
              fontSize: '12px',
              fontWeight: '700',
              padding: '3px 10px',
              borderRadius: '9999px'
            }}>
              ACTIVE
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '36px', fontWeight: '900', color: currentStreak > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>
            {currentStreak}
          </span>
          <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>
            {currentStreak === 1 ? 'Day' : 'Days'} in a Row
          </span>
        </div>

        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
          {workedOutToday 
            ? '🔥 You checked in today! Great discipline!' 
            : currentStreak > 0 
              ? '⚡ Log a workout today to keep your streak alive!' 
              : 'Log a workout today to ignite your streak!'}
        </p>

        <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-light)' }}>
          🏆 Personal Best: <strong>{longestStreak} day{longestStreak === 1 ? '' : 's'}</strong>
        </div>
      </div>

      {/* Right: 7-Day Activity Week Matrix */}
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '12px' }}>
          This Week's Consistency:
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '8px',
          alignItems: 'center'
        }}>
          {weekDays.map(day => (
            <div 
              key={day.name}
              title={day.isCompleted ? `${day.name} (${day.dateStr}): ${day.minutes} mins of ${day.exercises.join(', ')}` : `${day.name}: Rest Day`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: '600', color: day.isToday ? 'var(--primary)' : 'var(--text-muted)' }}>
                {day.name}
              </span>

              {/* Day Circle */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '700',
                backgroundColor: day.isCompleted 
                  ? 'var(--success)' 
                  : day.isToday 
                    ? 'var(--primary-light)' 
                    : 'var(--bg-card-subtle)',
                color: day.isCompleted 
                  ? '#ffffff' 
                  : day.isToday 
                    ? 'var(--primary)' 
                    : 'var(--text-muted)',
                border: day.isToday 
                  ? '2px solid var(--primary)' 
                  : '1px solid var(--border-color)',
                boxShadow: day.isCompleted ? '0 2px 6px rgba(16, 185, 129, 0.35)' : 'none',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}>
                {day.isCompleted ? '✓' : day.dayNum}
              </div>

              <span style={{ fontSize: '10px', color: 'var(--text-light)', height: '12px' }}>
                {day.isCompleted ? `${day.minutes}m` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StreakTracker;
