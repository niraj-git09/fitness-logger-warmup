import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SplashAnimation from './SplashAnimation';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const navigate = useNavigate();

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token); 
        setShowSplash(true);
      } else {
        const data = await response.json();
        setErrorMessage(data.error || 'Invalid credentials');
      }
    } catch (error) {
      setErrorMessage('Server connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showSplash) {
    return (
      <SplashAnimation 
        message="Welcome back! Powering up your training hub..." 
        durationMs={3500}
        onComplete={() => navigate('/dashboard')} 
      />
    );
  }

  return (
    <div style={{
      maxWidth: '420px',
      margin: '60px auto',
      padding: '36px 32px',
      backgroundColor: 'var(--bg-card)',
      borderRadius: '20px',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-lg)',
      textAlign: 'center',
      position: 'relative',
      transition: 'background-color 0.3s ease, border-color 0.3s ease'
    }}>
      {/* Theme Toggle in Login Corner */}
      <button
        type="button"
        onClick={toggleTheme}
        title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'var(--bg-card-subtle)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '14px',
          color: 'var(--text-main)'
        }}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {/* FitCheck Brand Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
        <img 
          src="/fitcheck-icon.png" 
          alt="FitCheck Icon" 
          style={{ 
            height: '54px',
            width: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 14px rgba(56, 189, 248, 0.45))',
            marginBottom: '8px'
          }} 
        />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', lineHeight: 1 }}>
          <span style={{ fontSize: '26px', fontWeight: '900', fontStyle: 'italic', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            FIT
          </span>
          <span style={{
            fontSize: '26px',
            fontWeight: '900',
            fontStyle: 'italic',
            letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #38bdf8 0%, #22c55e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 12px rgba(34, 197, 94, 0.35))'
          }}>
            CHECK
          </span>
        </div>
        <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '1.2px', textTransform: 'uppercase', marginTop: '4px' }}>
          Your Personal Fitness Logger
        </span>
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 6px 0' }}>
        Welcome Back
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 22px 0' }}>
        Log in to track your workouts, streaks, and fitness goals.
      </p>

      {errorMessage && (
        <div style={{
          backgroundColor: 'var(--danger-light)',
          border: '1px solid var(--danger)',
          color: 'var(--danger-text)',
          padding: '10px 14px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '500',
          marginBottom: '18px',
          textAlign: 'left'
        }}>
          ⚠️ {errorMessage}
        </div>
      )}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Email Address
          </label>
          <input 
            type="email" 
            placeholder="you@example.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={authInputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Password
          </label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={authInputStyle}
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          style={{
            marginTop: '8px',
            padding: '12px',
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.25)'
          }}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <p style={{ marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
          Create an account
        </Link>
      </p>
    </div>
  );
}

const authInputStyle = {
  width: '100%',
  padding: '11px 14px',
  border: '1px solid var(--border-color)',
  borderRadius: '10px',
  fontSize: '14px',
  backgroundColor: 'var(--bg-card)',
  color: 'var(--text-main)'
};

export default Login;