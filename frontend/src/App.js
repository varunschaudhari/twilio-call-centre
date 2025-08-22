import React, { useState } from 'react';
import Login from './components/Login';
import ApiTest from './components/ApiTest';

function App() {
  const [showApiTest, setShowApiTest] = useState(false);

  return (
    <div>
      {/* Main Login Component */}
      <Login />

      {/* API Test Toggle */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 1000
      }}>
        <button
          onClick={() => setShowApiTest(!showApiTest)}
          style={{
            padding: '8px 12px',
            backgroundColor: showApiTest ? '#dc3545' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          {showApiTest ? 'Hide API Test' : 'Show API Test'}
        </button>
      </div>

      {/* API Test Component (conditionally shown) */}
      {showApiTest && (
        <div style={{
          position: 'fixed',
          top: '50px',
          right: '10px',
          width: '400px',
          maxHeight: '80vh',
          overflowY: 'auto',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '15px',
          zIndex: 999,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <ApiTest />
        </div>
      )}
    </div>
  );
}

export default App;
