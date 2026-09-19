import { useEffect, useMemo, useState } from 'react';
import { calculateCalories, calculateTotalCalories } from './utils/calorieUtils';
import { exportToCSV } from './utils/exportUtils';

function WeeklyReportModal({ workouts = [], profile, onClose }) {
  const [reportScope, setReportScope] = useState('week'); // 'week' or 'all'

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Compute date range and filtered sessions for the report
  const { filteredWorkouts, dateRangeLabel, totalMinutes, totalCalories, goalPercent } = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    let list = workouts;
    let label = 'All-Time Lifetime Activity';

    if (reportScope === 'week') {
      list = workouts.filter(w => {
        if (!w.date_logged) return false;
        const d = new Date(w.date_logged);
        return d >= monday && d <= sunday;
      });
      label = `${monday.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} – ${sunday.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }

    const minutes = list.reduce((sum, w) => sum + Number(w.duration_minutes || 0), 0);
    const calories = calculateTotalCalories(list);
    const weeklyGoal = profile?.weekly_goal_minutes || 150;
    const percent = Math.min(200, Math.round((minutes / weeklyGoal) * 100));

    return {
      filteredWorkouts: list,
      dateRangeLabel: label,
      totalMinutes: minutes,
      totalCalories: calories,
      goalPercent: percent
    };
  }, [workouts, profile, reportScope]);

  // Activity breakdown map
  const activityBreakdown = useMemo(() => {
    const map = {};
    filteredWorkouts.forEach(w => {
      const type = w.exercise_type || 'Other';
      if (!map[type]) map[type] = { minutes: 0, sessions: 0 };
      map[type].minutes += Number(w.duration_minutes || 0);
      map[type].sessions += 1;
    });
    return Object.entries(map).sort((a, b) => b[1].minutes - a[1].minutes);
  }, [filteredWorkouts]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    exportToCSV(filteredWorkouts, `fitness_report_${reportScope}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const displayName = profile?.name || (profile?.email ? profile.email.split('@')[0] : 'Athlete');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card printable-report"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          padding: '32px',
          boxShadow: 'var(--shadow-xl)',
          textAlign: 'left',
          position: 'relative'
        }}
      >
        {/* Modal Controls Header (hidden during print) */}
        <div className="no-print" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-color)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Scope Toggle: This Week vs All-Time */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginRight: '4px' }}>
              Period:
            </span>
            <button
              type="button"
              onClick={() => setReportScope('week')}
              style={{
                backgroundColor: reportScope === 'week' ? 'var(--primary)' : 'var(--bg-card-subtle)',
                color: reportScope === 'week' ? '#ffffff' : 'var(--text-muted)',
                border: reportScope === 'week' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                padding: '5px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              📅 This Week
            </button>
            <button
              type="button"
              onClick={() => setReportScope('all')}
              style={{
                backgroundColor: reportScope === 'all' ? 'var(--primary)' : 'var(--bg-card-subtle)',
                color: reportScope === 'all' ? '#ffffff' : 'var(--text-muted)',
                border: reportScope === 'all' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                padding: '5px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              📊 All-Time
            </button>
          </div>

          {/* Action Buttons: Print, Download, Close */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handlePrint}
              title="Print report or save as PDF"
              style={{
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🖨️</span>
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              title="Download workouts as CSV spreadsheet"
              style={{
                backgroundColor: 'var(--bg-card-subtle)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>📥</span>
              <span>CSV</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              title="Close modal (Esc)"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '6px'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Report Content Body (Printed) */}
        <div id="print-area">
          {/* Printable Report Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid var(--border-color)',
            paddingBottom: '20px',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '24px' }}>🏋️</span>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: 'var(--text-main)' }}>
                  Fitness Performance Report
                </h2>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                Generated for <strong>{displayName}</strong> ({profile?.email || 'Registered Athlete'})
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '12px',
                fontWeight: '700',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '4px 12px',
                borderRadius: '9999px',
                display: 'inline-block',
                marginBottom: '4px'
              }}>
                {dateRangeLabel}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                Generated on {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Key Metric Highlights Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '14px',
            marginBottom: '28px'
          }}>
            <div style={reportStatBoxStyle}>
              <div style={reportStatValueStyle}>{filteredWorkouts.length}</div>
              <div style={reportStatLabelStyle}>Total Sessions</div>
            </div>
            <div style={reportStatBoxStyle}>
              <div style={reportStatValueStyle}>
                {totalMinutes} <span style={{ fontSize: '14px', fontWeight: '600' }}>mins</span>
              </div>
              <div style={reportStatLabelStyle}>Active Time</div>
            </div>
            <div style={reportStatBoxStyle}>
              <div style={{ ...reportStatValueStyle, color: 'var(--warning)' }}>
                🔥 {totalCalories.toLocaleString()}
              </div>
              <div style={reportStatLabelStyle}>Calories Burned</div>
            </div>
            <div style={reportStatBoxStyle}>
              <div style={{ ...reportStatValueStyle, color: goalPercent >= 100 ? 'var(--success)' : 'var(--primary)' }}>
                {goalPercent}%
              </div>
              <div style={reportStatLabelStyle}>Goal Completion</div>
            </div>
          </div>

          {/* Activity Breakdown Chips */}
          {activityBreakdown.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Activity Breakdown
              </h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {activityBreakdown.map(([sport, data]) => (
                  <div key={sport} style={{
                    backgroundColor: 'var(--bg-card-subtle)',
                    border: '1px solid var(--border-color)',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}>
                    <strong style={{ color: 'var(--text-main)' }}>{sport}:</strong>{' '}
                    <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{data.minutes}m</span>{' '}
                    <span style={{ color: 'var(--text-muted)' }}>({data.sessions} session{data.sessions > 1 ? 's' : ''})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Session Logs Table */}
          <div>
            <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Logged Sessions ({filteredWorkouts.length})
            </h4>

            {filteredWorkouts.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', backgroundColor: 'var(--bg-card-subtle)', borderRadius: '12px' }}>
                No workouts recorded for this time period.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '12px',
                  textAlign: 'left'
                }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--bg-card-subtle)' }}>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Exercise</th>
                      <th style={thStyle}>Duration</th>
                      <th style={thStyle}>Calories</th>
                      <th style={thStyle}>Intensity</th>
                      <th style={thStyle}>Session Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorkouts.map((w, idx) => (
                      <tr 
                        key={w.id || idx} 
                        style={{ 
                          borderBottom: '1px solid var(--border-color)',
                          backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--bg-card-subtle)'
                        }}
                      >
                        <td style={tdStyle}>{(w.date_logged || '').split('T')[0]}</td>
                        <td style={{ ...tdStyle, fontWeight: '600', color: 'var(--text-main)' }}>{w.exercise_type}</td>
                        <td style={tdStyle}>{w.duration_minutes} mins</td>
                        <td style={tdStyle}>{calculateCalories(w.exercise_type, w.duration_minutes)} kcal</td>
                        <td style={tdStyle}>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            padding: '2px 6px',
                            borderRadius: '9999px',
                            backgroundColor: (w.intensity || '').toLowerCase() === 'high' 
                              ? 'var(--danger-light)' 
                              : (w.intensity || '').toLowerCase() === 'low' 
                                ? 'var(--success-light)' 
                                : 'var(--warning-light)',
                            color: (w.intensity || '').toLowerCase() === 'high' 
                              ? 'var(--danger-text)' 
                              : (w.intensity || '').toLowerCase() === 'low' 
                                ? 'var(--success-text)' 
                                : 'var(--warning-text)'
                          }}>
                            {(w.intensity || 'medium').toUpperCase()}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: 'var(--text-muted)', fontStyle: w.notes ? 'italic' : 'normal' }}>
                          {w.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const reportStatBoxStyle = {
  backgroundColor: 'var(--bg-card-subtle)',
  border: '1px solid var(--border-color)',
  borderRadius: '12px',
  padding: '14px 16px',
  textAlign: 'center'
};

const reportStatValueStyle = {
  fontSize: '22px',
  fontWeight: '800',
  color: 'var(--text-main)',
  marginBottom: '2px'
};

const reportStatLabelStyle = {
  fontSize: '11px',
  fontWeight: '600',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const thStyle = {
  padding: '10px 12px',
  fontWeight: '700',
  color: 'var(--text-muted)',
  fontSize: '11px',
  textTransform: 'uppercase'
};

const tdStyle = {
  padding: '10px 12px',
  color: 'var(--text-main)'
};

export default WeeklyReportModal;
