# Socket.IO Setup & Usage Guide

## 📦 Installation

Socket.IO client has been installed in the frontend:

```bash
npm install socket.io-client
```

## 🏗️ Architecture

### 1. **Socket Manager** (`src/utils/socketio.js`)
- **Singleton pattern** for managing socket connections
- **Automatic reconnection** with configurable attempts
- **Event listener management** with cleanup
- **Call center specific methods** for real-time features

### 2. **React Hooks** (`src/hooks/useSocket.js`)
- **`useSocket()`** - General Socket.IO hook
- **`useCallCenterSocket()`** - Specialized hook for call center features
- **Automatic cleanup** of event listeners
- **Connection status management**

### 3. **Test Component** (`src/components/SocketTest.js`)
- **Interactive testing** of all Socket.IO features
- **Real-time message display**
- **Connection status monitoring**

## 🔌 Connection Setup

### Basic Usage
```javascript
import { useSocket } from '../hooks/useSocket';

function MyComponent() {
    const { isConnected, connect, disconnect, emit, on } = useSocket();
    
    // Auto-connects by default
    // Manual connection: connect('http://localhost:3001')
}
```

### Call Center Usage
```javascript
import { useCallCenterSocket } from '../hooks/useSocket';

function CallCenterComponent() {
    const {
        isConnected,
        incomingCalls,
        activeCalls,
        agentStatus,
        acceptCall,
        rejectCall,
        setAgentAvailable
    } = useCallCenterSocket();
}
```

## 📡 Available Events

### Connection Events
- `connect` - Socket connected
- `disconnect` - Socket disconnected
- `connect_error` - Connection error
- `reconnect` - Reconnected after disconnection

### Custom Events
- `welcome` - Welcome message from server
- `room-joined` - Successfully joined a room
- `room-left` - Left a room

### Call Center Events
- `call-incoming` - New incoming call
- `call-ended` - Call ended
- `call-transferred` - Call transferred to another agent
- `agent-status-updated` - Agent status changed
- `queue-updated` - Call queue updated
- `dashboard-stats-updated` - Dashboard statistics updated

## 🎯 Available Methods

### Connection Management
```javascript
const socket = useSocket();

// Connect to server
socket.connect('http://localhost:3001');

// Disconnect
socket.disconnect();

// Get connection status
const status = socket.getStatus();
```

### Event Communication
```javascript
// Emit event to server
socket.emit('custom-event', { data: 'value' });

// Listen for events
socket.on('server-event', (data) => {
    console.log('Received:', data);
});
```

### Room Management
```javascript
// Join a room
socket.joinRoom('room-name');

// Leave a room
socket.leaveRoom('room-name');
```

### Call Center Methods
```javascript
const callCenter = useCallCenterSocket();

// Join call center as agent
callCenter.joinCallCenter('agent-001');

// Update agent status
callCenter.updateAgentStatus('agent-001', 'available');

// Handle incoming call
callCenter.handleIncomingCall({ callId: '123', action: 'accept' });

// End call
callCenter.endCall('call-123');

// Transfer call
callCenter.transferCall('call-123', 'agent-002');
```

## 🧪 Testing

### Socket Test Component
The `SocketTest` component provides a comprehensive testing interface:

1. **Connection Controls** - Connect/disconnect
2. **Room Management** - Join/leave rooms
3. **Call Center Features** - Agent status, incoming calls
4. **Real-time Messages** - View all received events
5. **Custom Events** - Send test messages

### Access Test Component
```javascript
// In App.js, click "Show Socket Test" button
// Or import directly:
import SocketTest from './components/SocketTest';
```

## 🔧 Configuration

### Socket Manager Options
```javascript
// In src/utils/socketio.js
const socket = io(url, {
    transports: ['websocket', 'polling'],
    timeout: 20000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    maxReconnectionAttempts: 5,
    autoConnect: true
});
```

### Environment Variables
```javascript
// Add to .env file
REACT_APP_SOCKET_URL=http://localhost:3001
```

## 🚀 Usage Examples

### 1. Basic Real-time Chat
```javascript
function ChatComponent() {
    const [messages, setMessages] = useState([]);
    const { emit, on } = useSocket();
    
    useEffect(() => {
        on('new-message', (message) => {
            setMessages(prev => [...prev, message]);
        });
    }, [on]);
    
    const sendMessage = (text) => {
        emit('send-message', { text, timestamp: Date.now() });
    };
}
```

### 2. Call Center Dashboard
```javascript
function CallCenterDashboard() {
    const {
        incomingCalls,
        activeCalls,
        agentStatus,
        queueStatus,
        acceptCall,
        setAgentAvailable
    } = useCallCenterSocket();
    
    return (
        <div>
            <h2>Call Center Dashboard</h2>
            <p>Status: {agentStatus}</p>
            <p>Incoming Calls: {incomingCalls.length}</p>
            <p>Active Calls: {activeCalls.length}</p>
            <p>Queue Length: {queueStatus.length}</p>
            
            {incomingCalls.map(call => (
                <div key={call.id}>
                    <span>Call from {call.from}</span>
                    <button onClick={() => acceptCall(call.id)}>Accept</button>
                </div>
            ))}
        </div>
    );
}
```

### 3. Real-time Notifications
```javascript
function NotificationComponent() {
    const { on } = useSocket();
    
    useEffect(() => {
        on('call-incoming', (callData) => {
            // Show browser notification
            new Notification('Incoming Call', {
                body: `Call from ${callData.from}`,
                icon: '/icon.png'
            });
        });
    }, [on]);
}
```

## 🛠️ Backend Integration

### Required Backend Events
Your backend should handle these events:

```javascript
// Server-side (Node.js + Socket.IO)
io.on('connection', (socket) => {
    // Welcome message
    socket.emit('welcome', { message: 'Welcome to the call center!' });
    
    // Handle room joining
    socket.on('join-room', (roomName) => {
        socket.join(roomName);
        socket.emit('room-joined', { room: roomName });
    });
    
    // Handle call center events
    socket.on('join-call-center', (data) => {
        socket.join('call-center');
        socket.emit('agent-status-updated', { agentId: data.agentId, status: 'online' });
    });
    
    // Handle incoming calls
    socket.on('test-incoming-call', (callData) => {
        socket.to('call-center').emit('call-incoming', callData);
    });
});
```

## 🔒 Security Considerations

1. **Authentication** - Implement proper authentication before allowing socket connections
2. **Authorization** - Validate user permissions for specific events
3. **Rate Limiting** - Implement rate limiting for socket events
4. **Input Validation** - Validate all data received from clients

## 📊 Monitoring

### Connection Status
```javascript
const { isConnected, socketId, connectionStatus } = useSocket();

// Monitor connection health
useEffect(() => {
    if (!isConnected) {
        console.warn('Socket disconnected, attempting reconnection...');
    }
}, [isConnected]);
```

### Error Handling
```javascript
const { on } = useSocket();

useEffect(() => {
    on('error', (error) => {
        console.error('Socket error:', error);
        // Handle error appropriately
    });
}, [on]);
```

## 🎉 Benefits

- ✅ **Real-time Communication** - Instant updates across all clients
- ✅ **Automatic Reconnection** - Handles network issues gracefully
- ✅ **Event-driven Architecture** - Clean separation of concerns
- ✅ **Call Center Ready** - Built-in support for call center features
- ✅ **React Integration** - Custom hooks for easy React integration
- ✅ **Testing Tools** - Comprehensive testing interface
- ✅ **Error Handling** - Robust error handling and recovery

This Socket.IO setup provides a solid foundation for real-time features in your Twilio call center application! 🚀
