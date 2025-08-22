# Twilio Call Center - Frontend API Setup

## Overview

This project uses **Axios** for HTTP requests and **use-immer** for state management, integrated with a Twilio SMS verification backend.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install axios use-immer
```

### 2. Backend Connection
The frontend is configured to connect to the backend at `http://localhost:3000` (matching your backend server).

## 📁 File Structure

```
frontend/src/
├── services/
│   └── api.js              # Axios configuration and API endpoints
├── hooks/
│   └── useApi.js           # Custom hooks for API calls with use-immer
├── config/
│   └── api.config.js       # API configuration and constants
├── components/
│   ├── Login.js            # Updated for SMS verification
│   ├── ApiTest.js          # API connection test component
│   └── Dashboard.js        # Example dashboard with API calls
└── App.js                  # Main app with test components
```

## 🔧 API Configuration

### Base Configuration (`src/services/api.js`)
- **Base URL**: `http://localhost:3000` (matches your backend)
- **Timeout**: 10 seconds
- **Error Handling**: Automatic error parsing and logging

### Authentication Flow
Instead of JWT tokens, the app uses **Twilio SMS verification**:

1. **Send OTP**: `GET /login?to={phoneNumber}`
2. **Verify OTP**: `GET /verify?to={phoneNumber}&code={otp}`

### Available API Endpoints

#### Authentication
```javascript
import { authAPI } from '../services/api';

// Send SMS verification
await authAPI.sendVerification('+1234567890');

// Verify OTP
await authAPI.verifyOTP('+1234567890', '123456');
```

#### System
```javascript
import { systemAPI } from '../services/api';

// Health check
await systemAPI.healthCheck();

// Server status
await systemAPI.getStatus();
```

#### Call Management (Future Implementation)
```javascript
import { callAPI } from '../services/api';

// Get all calls
await callAPI.getCalls({ status: 'active' });

// End a call
await callAPI.endCall('call-id-123');
```

## 🎣 Custom Hooks

### useApi Hook
Provides loading, error, and data state management:

```javascript
import { useApi } from '../hooks/useApi';

function MyComponent() {
  const { loading, error, data, executeRequest } = useApi();

  const handleApiCall = async () => {
    await executeRequest(
      () => api.someEndpoint(),
      {
        onSuccess: (data) => console.log('Success:', data),
        onError: (error) => console.error('Error:', error)
      }
    );
  };
}
```

### useApiCall Hook
Simplified hook for specific API calls:

```javascript
import { useApiCall } from '../hooks/useApi';

function MyComponent() {
  const { loading, error, execute } = useApiCall(api.someEndpoint);

  const handleCall = async () => {
    await execute(params);
  };
}
```

## 🔄 State Management with use-immer

### Login Component Example
```javascript
import { useImmer } from 'use-immer';

function Login() {
  const [state, updateState] = useImmer({
    phoneNumber: '',
    otpCode: '',
    step: 'phone', // 'phone' or 'otp'
    showOtp: false
  });

  const handlePhoneChange = (e) => {
    updateState(draft => {
      draft.phoneNumber = e.target.value;
      if (draft.error) draft.error = '';
    });
  };
}
```

## 🧪 Testing API Connection

### ApiTest Component
The `ApiTest` component automatically tests the backend connection:

1. **Health Check**: Tests `/health` endpoint
2. **Error Handling**: Shows connection errors
3. **Response Display**: Shows backend status

### Manual Testing
```javascript
// Test health endpoint
curl http://localhost:3000/health

// Test login endpoint
curl "http://localhost:3000/login?to=+1234567890"

// Test verify endpoint
curl "http://localhost:3000/verify?to=+1234567890&code=123456"
```

## 🔒 Authentication Flow

### Current Implementation
1. **Phone Input**: User enters phone number
2. **Send OTP**: Frontend calls `/login` endpoint
3. **OTP Input**: User enters received OTP
4. **Verify OTP**: Frontend calls `/verify` endpoint
5. **Session Storage**: Stores `userPhone` and `isAuthenticated` in localStorage

### Session Management
```javascript
// Store authentication
localStorage.setItem('userPhone', phoneNumber);
localStorage.setItem('isAuthenticated', 'true');

// Check authentication
const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
const userPhone = localStorage.getItem('userPhone');
```

## 🚨 Error Handling

### Automatic Error Processing
- **Network Errors**: Connection issues
- **Server Errors**: 4xx/5xx responses
- **Timeout Errors**: Request timeouts
- **Validation Errors**: Invalid input

### Error Response Format
```javascript
{
  message: "Error description",
  status: 400,
  data: { /* additional error details */ }
}
```

## 🔧 Configuration

### Environment Variables
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:3000

# Twilio Configuration
REACT_APP_TWILIO_ACCOUNT_SID=your_account_sid
REACT_APP_TWILIO_AUTH_TOKEN=your_auth_token
REACT_APP_TWILIO_VERIFY_SERVICE=your_verify_service_sid
```

### API Config Object
```javascript
import { API_CONFIG } from '../config/api.config';

console.log(API_CONFIG.BASE_URL); // http://localhost:3000
console.log(API_CONFIG.TIMEOUT);  // 10000
```

## 📊 Usage Examples

### Dashboard with Multiple API Calls
```javascript
import { useApiCall } from '../hooks/useApi';
import { dashboardAPI, callAPI, agentAPI } from '../services/api';

function Dashboard() {
  const { loading: statsLoading, execute: fetchStats } = useApiCall(dashboardAPI.getStats);
  const { loading: callsLoading, execute: fetchCalls } = useApiCall(callAPI.getCalls);
  const { loading: agentsLoading, execute: fetchAgents } = useApiCall(agentAPI.getAgents);

  useEffect(() => {
    // Fetch all data in parallel
    Promise.all([
      fetchStats(),
      fetchCalls({ status: 'active' }),
      fetchAgents()
    ]);
  }, []);
}
```

## 🎯 Next Steps

1. **Backend Implementation**: Add the missing API endpoints in your backend
2. **Real-time Updates**: Implement WebSocket connections for live updates
3. **Call Management**: Add Twilio Voice SDK integration
4. **Agent Dashboard**: Create agent-specific interfaces
5. **Call Routing**: Implement intelligent call routing logic

## 🔍 Debugging

### Console Logging
All API calls are logged to the console for debugging:
- Request details
- Response data
- Error information

### Network Tab
Check the browser's Network tab to see:
- Request/response headers
- Request payload
- Response data
- Timing information

## 📝 Notes

- **No JWT**: The current setup doesn't use JWT tokens
- **SMS Verification**: Authentication is handled via Twilio SMS
- **Stateless**: Backend doesn't maintain session state
- **CORS**: Backend is configured to accept requests from any origin
- **Socket.IO**: Backend has Socket.IO ready for real-time features

This setup provides a solid foundation for your Twilio call center application with clean, maintainable code and excellent developer experience!
