import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        navigate('/login?registered=true');
      } else {
        const data = await response.json();
        setErrorMessage(data.error || 'Registration failed.');
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
        backgroundColor: '#10b981',
        borderRadius: '14px',
        margin: '0 auto 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px'
      }}>
        🚀
      </div>

      <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
        Create Account
      </h2>
      <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px 0' }}>
        Start logging your workouts and tracking your goals.
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

      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
            Full Name (Optional)
          </label>
          <input 
            type="text" 
            placeholder="e.g. Alex Morgan" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            style={authInputStyle}
          />
        </div>

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
            backgroundColor: '#10b981',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.25)'
          }}
        >
          {isLoading ? 'Creating Account...' : 'Get Started'}
        </button>
      </form>

      <p style={{ marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#4f46e5', fontWeight: '600', textDecoration: 'none' }}>
          Sign in here
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

export default Register;