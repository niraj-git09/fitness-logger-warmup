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
      backgroundColor: 'var(--bg-card)',
      borderRadius: '16px',
      border: '1px solid var(--border-color)',
      padding: '24px 26px',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      boxSizing: 'border-box',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🔥</span>
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

        <span style={{
          backgroundColor: 'var(--bg-card-subtle)',
          color: 'var(--text-muted)',
          fontSize: '12px',
          fontWeight: '600',
          padding: '4px 10px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          🏆 Best: {longestStreak} day{longestStreak === 1 ? '' : 's'}
        </span>
      </div>

      {/* Middle Content Row: Streak Counter on left, 7-Day Consistency on right */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '18px',
        marginBottom: '14px'
      }}>
        {/* Left: Streak Counter & Status */}
        <div style={{ minWidth: '160px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '36px', fontWeight: '900', color: currentStreak > 0 ? 'var(--warning)' : 'var(--text-muted)', lineHeight: 1 }}>
              {currentStreak}
            </span>
            <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>
              {currentStreak === 1 ? 'Day' : 'Days'} Streak
            </span>
          </div>

          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
            {workedOutToday 
              ? '🔥 Checked in today! Great discipline!' 
              : currentStreak > 0 
                ? '⚡ Log today to keep your streak!' 
                : 'Log a workout today to ignite your streak!'}
          </p>
        </div>

        {/* Right: 7-Day Activity Week Matrix */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'right' }}>
            7-Day Consistency:
          </div>

          <div style={{
            display: 'flex',
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
                  gap: '4px'
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: '600', color: day.isToday ? 'var(--primary)' : 'var(--text-muted)' }}>
                  {day.name}
                </span>

                {/* Day Circle */}
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
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
                  transition: 'all 0.2s ease'
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

      {/* Bottom Summary Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '6px',
        fontSize: '12px',
        color: 'var(--text-light)'
      }}>
        <span>{weekDays.filter(d => d.isCompleted).length} of 7 days active this week</span>
        <span>{workedOutToday ? 'Today completed! 🔥' : 'Log a session to keep it alive ⚡'}</span>
      </div>
    </div>
  );
}

export default StreakTracker;
