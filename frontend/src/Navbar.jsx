import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar({ profile, onOpenLogModal, onReplayIntro }) {
  const navigate = useNavigate();

  // Initialize theme from localStorage or system preference
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getInitials = () => {
    if (profile?.name) {
      return profile.name.slice(0, 2).toUpperCase();
    }
    if (profile?.email) {
      return profile.email.slice(0, 2).toUpperCase();
    }
    return '👤';
  };

  const displayName = profile?.name || (profile?.email ? profile.email.split('@')[0] : 'Athlete');

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 24px',
      backgroundColor: 'var(--navbar-bg)',
      color: '#ffffff',
      borderRadius: '18px',
      marginBottom: '26px',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
      flexWrap: 'wrap',
      gap: '16px',
      transition: 'background-color 0.3s ease'
    }}>
      {/* Brand Identity */}
      <div 
        onClick={onReplayIntro}
        title="FitCheck • Click to replay intro animation"
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: onReplayIntro ? 'pointer' : 'default', userSelect: 'none' }}
      >
        <img 
          src="/fitcheck-icon.png" 
          alt="FitCheck Icon" 
          style={{ 
            height: '42px',
            width: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.45))'
          }} 
        />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1px', lineHeight: 1 }}>
            <span style={{
              fontSize: '22px',
              fontWeight: '900',
              fontStyle: 'italic',
              letterSpacing: '-0.3px',
              color: '#ffffff'
            }}>
              FIT
            </span>
            <span style={{
              fontSize: '22px',
              fontWeight: '900',
              fontStyle: 'italic',
              letterSpacing: '-0.3px',
              background: 'linear-gradient(135deg, #38bdf8 0%, #22c55e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 12px rgba(34, 197, 94, 0.35))'
            }}>
              CHECK
            </span>
          </div>
          <span style={{
            fontSize: '10px',
            fontWeight: '700',
            color: '#94a3b8',
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            marginTop: '3px'
          }}>
            Your Personal Fitness Logger
          </span>
        </div>
      </div>

      {/* User Info & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        {/* Quick Log Action */}
        {onOpenLogModal && (
          <button
            onClick={onOpenLogModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              padding: '7px 16px',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)',
              cursor: 'pointer'
            }}
          >
            <span>➕</span>
            <span>Log Session</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Profile Chip */}
        {profile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '5px 12px',
            borderRadius: '9999px'
          }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '11px',
              color: '#ffffff'
            }}>
              {getInitials()}
            </div>

            <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>
                {displayName}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                {profile.email}
              </div>
            </div>
          </div>
        )}

        {/* Log Out Button */}
        <button 
          onClick={handleLogout}
          title="Sign out of your account"
          style={{
            padding: '7px 15px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>🚪</span>
          <span>Log Out</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
