import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Smart Pocket Web</h1>
      <p>Welcome to the web application for Smart Pocket</p>
      <button onClick={() => setCount((c) => c + 1)} style={{ padding: '10px 20px', marginTop: '20px' }}>
        Counter: {count}
      </button>
    </div>
  );
}

export default App;
