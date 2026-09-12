import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';

// 1. THE FRONTEND BOUNCER
// This function checks for a token before rendering the page
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  // If there is no token, redirect them instantly to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // If they have a token, let them see the component (children)
  return children;
};

function App() {
  return (
    <Router>
      <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* 2. PROTECTED DASHBOARD ROUTE */}
          {/* We wrap the Dashboard inside our ProtectedRoute */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;