import { useNavigate } from 'react-router-dom';

function Navbar({ profile }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Generate initials from name or email
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
      padding: '16px 28px',
      backgroundColor: '#0f172a',
      color: '#ffffff',
      borderRadius: '16px',
      marginBottom: '24px',
      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      {/* Brand Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          backgroundColor: '#4f46e5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px'
        }}>
          🏋️
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Fitness Logger
          </h2>
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Personal Performance
          </span>
        </div>
      </div>

      {/* User Info & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {profile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            padding: '6px 14px',
            borderRadius: '9999px'
          }}>
            {/* Avatar Initials Bubble */}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '12px',
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
          style={{
            padding: '8px 18px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
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
