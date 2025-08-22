import React, { useState } from 'react';
import Login from './components/Login';
import ApiTest from './components/ApiTest';
import SocketTest from './components/SocketTest';

function App() {
  const [showApiTest, setShowApiTest] = useState(false);
  const [showSocketTest, setShowSocketTest] = useState(false);

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
            fontSize: '12px',
            marginRight: '10px'
          }}
        >
          {showApiTest ? 'Hide API Test' : 'Show API Test'}
        </button>

        <button
          onClick={() => setShowSocketTest(!showSocketTest)}
          style={{
            padding: '8px 12px',
            backgroundColor: showSocketTest ? '#dc3545' : '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          {showSocketTest ? 'Hide Socket Test' : 'Show Socket Test'}
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

      {/* Socket Test Component (conditionally shown) */}
      {showSocketTest && (
        <div style={{
          position: 'fixed',
          top: '50px',
          left: '10px',
          width: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '15px',
          zIndex: 999,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <SocketTest />
        </div>
      )}
    </div>
  );
}

export default App;
