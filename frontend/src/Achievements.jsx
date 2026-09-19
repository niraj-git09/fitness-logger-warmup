import { useState, useMemo } from 'react';

function Achievements({ workouts = [], profile }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const goal = profile?.weekly_goal_minutes || 150;

  // Compute metrics for achievements
  const { achievements, unlockedCount } = useMemo(() => {
    const totalSessions = workouts.length;
    const totalMinutes = workouts.reduce((sum, w) => sum + Number(w.duration_minutes || 0), 0);
    const maxSingleDuration = workouts.reduce((max, w) => Math.max(max, Number(w.duration_minutes || 0)), 0);
    
    // Unique exercise types
    const uniqueActivities = new Set(
      workouts.map(w => (w.exercise_type || '').toLowerCase().trim()).filter(Boolean)
    );

    // Current week calculation for Goal Crusher
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const thisWeekMinutes = workouts
      .filter(w => new Date(w.date_logged) >= monday)
      .reduce((sum, w) => sum + Number(w.duration_minutes || 0), 0);

    // Streaks calculation
    const dateMap = {};
    workouts.forEach(w => {
      const d = (w.date_logged || '').split('T')[0];
      if (d) dateMap[d] = true;
    });

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
      if (tempStreak > maxStreak) maxStreak = tempStreak;
    });

    const badgeList = [
      {
        id: 'first_workout',
        icon: '🥇',
        title: 'First Step',
        description: 'Log your very first workout session',
        unlocked: totalSessions >= 1,
        progress: Math.min(1, totalSessions),
        target: 1,
        unit: 'session'
      },
      {
        id: 'century_club',
        icon: '⏱️',
        title: 'Century Club',
        description: 'Accumulate 100+ total active minutes',
        unlocked: totalMinutes >= 100,
        progress: Math.min(100, totalMinutes),
        target: 100,
        unit: 'mins'
      },
      {
        id: 'goal_crusher',
        icon: '🎯',
        title: 'Goal Crusher',
        description: 'Reach 100% of your weekly minute target',
        unlocked: thisWeekMinutes >= goal,
        progress: Math.min(goal, thisWeekMinutes),
        target: goal,
        unit: 'mins'
      },
      {
        id: 'habit_builder',
        icon: '🔥',
        title: 'Habit Builder',
        description: 'Achieve a 3-day consecutive active streak',
        unlocked: maxStreak >= 3,
        progress: Math.min(3, maxStreak),
        target: 3,
        unit: 'days'
      },
      {
        id: 'iron_will',
        icon: '⚡',
        title: 'Iron Will',
        description: 'Achieve a 7-day consecutive active streak',
        unlocked: maxStreak >= 7,
        progress: Math.min(7, maxStreak),
        target: 7,
        unit: 'days'
      },
      {
        id: 'variety_master',
        icon: '🌈',
        title: 'Variety Master',
        description: 'Log 3 or more distinct exercise activities',
        unlocked: uniqueActivities.size >= 3,
        progress: Math.min(3, uniqueActivities.size),
        target: 3,
        unit: 'types'
      },
      {
        id: 'high_intensity',
        icon: '🚀',
        title: 'High Intensity',
        description: 'Log a single session lasting 60+ minutes',
        unlocked: maxSingleDuration >= 60,
        progress: Math.min(60, maxSingleDuration),
        target: 60,
        unit: 'mins'
      },
      {
        id: 'elite_athlete',
        icon: '🏆',
        title: 'Elite Athlete',
        description: 'Log 10 or more lifetime workout sessions',
        unlocked: totalSessions >= 10,
        progress: Math.min(10, totalSessions),
        target: 10,
        unit: 'sessions'
      }
    ];

    const unlockedCount = badgeList.filter(b => b.unlocked).length;
    return { achievements: badgeList, unlockedCount };
  }, [workouts, profile, goal]);

  const displayedBadges = isExpanded ? achievements : achievements.slice(0, 4);

  return (
    <div style={{
      width: '100%',
      backgroundColor: 'var(--bg-card)',
      borderRadius: '16px',
      border: '1px solid var(--border-color)',
      padding: '22px 24px',
      boxShadow: 'var(--shadow-sm)',
      textAlign: 'left',
      transition: 'background-color 0.3s ease, border-color 0.3s ease'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '22px' }}>🎖️</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>
              Milestone Achievements
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Earn badges as you stay consistent and challenge yourself
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            backgroundColor: unlockedCount > 0 ? 'var(--success-light)' : 'var(--bg-card-subtle)',
            color: unlockedCount > 0 ? 'var(--success-text)' : 'var(--text-muted)',
            fontWeight: '700',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '12px'
          }}>
            🌟 {unlockedCount} of {achievements.length} Unlocked
          </span>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '13px',
              color: 'var(--text-main)',
              cursor: 'pointer',
              fontWeight: '500',
              backgroundColor: 'var(--bg-card-subtle)'
            }}
          >
            {isExpanded ? 'Show Less 🔼' : `View All (${achievements.length}) 🔽`}
          </button>
        </div>
      </div>

      {/* Badges Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px'
      }}>
        {displayedBadges.map(badge => {
          const percent = Math.round((badge.progress / badge.target) * 100);

          return (
            <div 
              key={badge.id}
              style={{
                backgroundColor: badge.unlocked ? 'var(--bg-card)' : 'var(--bg-card-subtle)',
                border: badge.unlocked ? '1px solid var(--border-color)' : '1px dashed var(--border-color)',
                borderRadius: '12px',
                padding: '16px 14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                boxShadow: badge.unlocked ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
                opacity: badge.unlocked ? 1 : 0.75,
                transition: 'all 0.2s ease'
              }}
            >
              {/* Badge Icon */}
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: badge.unlocked ? 'var(--primary-light)' : 'rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                marginBottom: '10px',
                boxShadow: badge.unlocked ? '0 0 12px rgba(99, 102, 241, 0.25)' : 'none',
                filter: badge.unlocked ? 'none' : 'grayscale(100%)'
              }}>
                {badge.icon}
              </div>

              {/* Title & Description */}
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
                {badge.title}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.3', marginBottom: '10px', minHeight: '28px' }}>
                {badge.description}
              </div>

              {/* Unlocked Badge or Progress Bar */}
              {badge.unlocked ? (
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'var(--success-text)',
                  backgroundColor: 'var(--success-light)',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  marginTop: 'auto'
                }}>
                  ✓ UNLOCKED
                </span>
              ) : (
                <div style={{ width: '100%', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-light)', marginBottom: '4px' }}>
                    <span>Progress</span>
                    <span>{badge.progress}/{badge.target} {badge.unit}</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: 'rgba(0,0,0,0.08)',
                    borderRadius: '9999px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${percent}%`,
                      height: '100%',
                      backgroundColor: 'var(--primary)',
                      borderRadius: '9999px'
                    }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Achievements;
