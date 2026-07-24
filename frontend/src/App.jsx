import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import WorkoutForm from './WorkoutForm';
import WorkoutFeed from './WorkoutFeed';
import Login from './Login';       // Import the real Login component
import Register from './Register'; // Import the real Register component

// This acts as your private dashboard
const Dashboard = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <h2>My Fitness Dashboard</h2>
    <WorkoutForm />
    <WorkoutFeed />
  </div>
);

function App() {
  return (
    <Router>
      <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
        <h1>Daily Fitness Logger</h1>
        
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        
      </div>
    </Router>
  );
}

export default App;