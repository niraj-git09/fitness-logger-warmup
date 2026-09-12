import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import WorkoutForm from './WorkoutForm';
import WorkoutFeed from './WorkoutFeed';
import Login from './Login';
import Register from './Register';
import Navbar from './Navbar';

// 1. THE FRONTEND BOUNCER
// This function checks for a token before rendering the page
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  // If there is no token, redirect them instantly to login
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  // If they have a token, let them see the component (children)
  return children;
};

const Dashboard = () => (
  <div>
    <Navbar />
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <WorkoutForm />
      <WorkoutFeed />
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* 2. PROTECTED DASHBOARD ROUTE */}
          {/* We wrap the Dashboard inside our new ProtectedRoute */}
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