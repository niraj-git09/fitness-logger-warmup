import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
        navigate('/dashboard');
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

  return (
    <div style={{
      maxWidth: '420px',
      margin: '60px auto',
      padding: '36px 32px',
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.06)',
      textAlign: 'center'
    }}>
      {/* Brand Icon */}
      <div style={{
        width: '54px',
        height: '54px',
        backgroundColor: '#4f46e5',
        borderRadius: '14px',
        margin: '0 auto 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px'
      }}>
        🏋️
      </div>

      <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
        Welcome Back
      </h2>
      <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px 0' }}>
        Log in to track your workouts and reach your goals.
      </p>

      {errorMessage && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fee2e2',
          color: '#991b1b',
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
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
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
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
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

      <p style={{ marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: '#4f46e5', fontWeight: '600', textDecoration: 'none' }}>
          Create an account
        </Link>
      </p>
    </div>
  );
}

const authInputStyle = {
  width: '100%',
  padding: '11px 14px',
  border: '1px solid #cbd5e1',
  borderRadius: '10px',
  fontSize: '14px',
  backgroundColor: '#ffffff'
};

export default Login;