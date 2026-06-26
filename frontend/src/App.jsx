import './App.css';
import WorkoutForm from './WorkoutForm';
import WorkoutFeed from './WorkoutFeed'; // Import the new component

function App() {
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Daily Fitness Logger</h1>
      
      <WorkoutForm />
      
      {/* Rendering the feed right below the form */}
      <WorkoutFeed />
      
    </div>
  )
}

export default App;