import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Destroy the VIP wristband (JWT token)
    localStorage.removeItem('token');
    // 2. Redirect back to login screen
    navigate('/login');
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 30px',
      backgroundColor: '#282c34',
      color: 'white',
      marginBottom: '30px',
      borderRadius: '8px'
    }}>
      <h2 style={{ margin: 0 }}>🏋️ Fitness Logger</h2>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <button 
          onClick={handleLogout}
          style={{
            padding: '8px 15px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Log Out
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
