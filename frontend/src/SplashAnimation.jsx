import { useState, useEffect, useRef } from 'react';

function SplashAnimation({ 
  message = "Welcome to FitCheck • Powering up your training hub...", 
  durationMs = 3800, 
  onComplete 
}) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);
  const completedRef = useRef(false);

  const triggerComplete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsFadingOut(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 400); // Allow fade-out animation to finish
  };

  useEffect(() => {
    // 1. Progress bar animation
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);
      if (elapsed >= durationMs) {
        clearInterval(interval);
        triggerComplete();
      }
    }, 30);

    // 2. Allow skipping via keyboard (Escape, Space, Enter)
    const handleKeyDown = (e) => {
      if (['Escape', ' ', 'Enter'].includes(e.key)) {
        triggerComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [durationMs]);

  return (
    <div 
      onClick={triggerComplete}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#070b13',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.02)' : 'scale(1)',
        transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
        cursor: 'pointer',
        userSelect: 'none'
      }}
    >
      {/* Top Skip Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          triggerComplete();
        }}
        style={{
          position: 'absolute',
          top: '24px',
          right: '28px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          color: '#cbd5e1',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '9999px',
          padding: '8px 18px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.color = '#cbd5e1';
        }}
      >
        <span>Skip</span>
        <span>✕</span>
      </button>

      {/* Video Cinema Container */}
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '780px',
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.25)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          backgroundColor: '#000000'
        }}
      >
        <video
          ref={videoRef}
          src="/fitcheck-intro.mp4"
          autoPlay
          muted
          playsInline
          onEnded={triggerComplete}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            objectFit: 'cover'
          }}
        />

        {/* Progress Bar inside Video Card */}
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          position: 'absolute',
          bottom: 0,
          left: 0
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #38bdf8, #22c55e)',
            boxShadow: '0 0 10px #22c55e',
            transition: 'width 0.08s linear'
          }} />
        </div>
      </div>

      {/* Bottom Message Banner */}
      <div style={{
        marginTop: '24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '9999px',
          padding: '6px 16px'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#22c55e',
            boxShadow: '0 0 8px #22c55e',
            display: 'inline-block'
          }} />
          <span style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#e2e8f0',
            letterSpacing: '0.2px'
          }}>
            {message}
          </span>
        </div>

        <span style={{ fontSize: '11px', color: '#64748b' }}>
          Click anywhere or press Esc to skip
        </span>
      </div>
    </div>
  );
}

export default SplashAnimation;
