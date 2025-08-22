import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';

function SocketTest() {
    const [message, setMessage] = useState('');
    const [roomName, setRoomName] = useState('');
    const [messages, setMessages] = useState([]);
    const [agentId, setAgentId] = useState('agent-001');
    
    const {
        isConnected,
        socketId,
        connectionStatus,
        connect,
        disconnect,
        emit,
        on,
        joinRoom,
        leaveRoom,
        joinCallCenter,
        updateAgentStatus,
        getStatus
    } = useSocket(false); // Don't auto-connect

    useEffect(() => {
        // Listen for welcome messages
        on('welcome', (data) => {
            addMessage('Welcome', data);
        });

        // Listen for room events
        on('room-joined', (data) => {
            addMessage('Room Joined', data);
        });

        on('room-left', (data) => {
            addMessage('Room Left', data);
        });

        // Listen for call center events
        on('call-incoming', (data) => {
            addMessage('Incoming Call', data);
        });

        on('call-ended', (data) => {
            addMessage('Call Ended', data);
        });

        on('agent-status-updated', (data) => {
            addMessage('Agent Status Updated', data);
        });

        on('queue-updated', (data) => {
            addMessage('Queue Updated', data);
        });

        on('dashboard-stats-updated', (data) => {
            addMessage('Dashboard Stats Updated', data);
        });

        return () => {
            // Cleanup is handled by useSocket hook
        };
    }, [on]);

    const addMessage = (type, data) => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            type,
            data,
            timestamp: new Date().toLocaleTimeString()
        }]);
    };

    const handleConnect = () => {
        connect();
    };

    const handleDisconnect = () => {
        disconnect();
    };

    const handleJoinRoom = () => {
        if (roomName.trim()) {
            joinRoom(roomName);
            setRoomName('');
        }
    };

    const handleLeaveRoom = () => {
        if (roomName.trim()) {
            leaveRoom(roomName);
            setRoomName('');
        }
    };

    const handleJoinCallCenter = () => {
        joinCallCenter(agentId);
    };

    const handleUpdateAgentStatus = (status) => {
        updateAgentStatus(agentId, status);
    };

    const handleEmitMessage = () => {
        if (message.trim()) {
            emit('custom-message', { message, timestamp: new Date().toISOString() });
            setMessage('');
        }
    };

    const handleTestCall = () => {
        emit('test-incoming-call', {
            callId: `call-${Date.now()}`,
            from: '+1234567890',
            timestamp: new Date().toISOString()
        });
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Socket.IO Test Component</h2>
            
            {/* Connection Status */}
            <div style={{ 
                padding: '15px', 
                backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
                border: `1px solid ${isConnected ? '#c3e6cb' : '#f5c6cb'}`,
                borderRadius: '5px',
                marginBottom: '20px'
            }}>
                <h4>Connection Status</h4>
                <p><strong>Status:</strong> {connectionStatus}</p>
                <p><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
                <p><strong>Socket ID:</strong> {socketId || 'N/A'}</p>
                <p><strong>Agent ID:</strong> {agentId}</p>
            </div>

            {/* Connection Controls */}
            <div style={{ marginBottom: '20px' }}>
                <h4>Connection Controls</h4>
                <button 
                    onClick={handleConnect}
                    disabled={isConnected}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: isConnected ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: isConnected ? 'not-allowed' : 'pointer',
                        marginRight: '10px'
                    }}
                >
                    Connect
                </button>
                <button 
                    onClick={handleDisconnect}
                    disabled={!isConnected}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: !isConnected ? '#ccc' : '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: !isConnected ? 'not-allowed' : 'pointer'
                    }}
                >
                    Disconnect
                </button>
            </div>

            {/* Room Controls */}
            <div style={{ marginBottom: '20px' }}>
                <h4>Room Controls</h4>
                <input
                    type="text"
                    placeholder="Room name"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        marginRight: '10px',
                        width: '200px'
                    }}
                />
                <button 
                    onClick={handleJoinRoom}
                    disabled={!isConnected || !roomName.trim()}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: !isConnected || !roomName.trim() ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: !isConnected || !roomName.trim() ? 'not-allowed' : 'pointer',
                        marginRight: '10px'
                    }}
                >
                    Join Room
                </button>
                <button 
                    onClick={handleLeaveRoom}
                    disabled={!isConnected || !roomName.trim()}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: !isConnected || !roomName.trim() ? '#ccc' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: !isConnected || !roomName.trim() ? 'not-allowed' : 'pointer'
                    }}
                >
                    Leave Room
                </button>
            </div>

            {/* Call Center Controls */}
            <div style={{ marginBottom: '20px' }}>
                <h4>Call Center Controls</h4>
                <button 
                    onClick={handleJoinCallCenter}
                    disabled={!isConnected}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: !isConnected ? '#ccc' : '#17a2b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: !isConnected ? 'not-allowed' : 'pointer',
                        marginRight: '10px'
                    }}
                >
                    Join Call Center
                </button>
                <button 
                    onClick={() => handleUpdateAgentStatus('available')}
                    disabled={!isConnected}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: !isConnected ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: !isConnected ? 'not-allowed' : 'pointer',
                        marginRight: '10px'
                    }}
                >
                    Set Available
                </button>
                <button 
                    onClick={() => handleUpdateAgentStatus('busy')}
                    disabled={!isConnected}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: !isConnected ? '#ccc' : '#ffc107',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: !isConnected ? 'not-allowed' : 'pointer',
                        marginRight: '10px'
                    }}
                >
                    Set Busy
                </button>
                <button 
                    onClick={() => handleUpdateAgentStatus('offline')}
                    disabled={!isConnected}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: !isConnected ? '#ccc' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: !isConnected ? 'not-allowed' : 'pointer'
                    }}
                >
                    Set Offline
                </button>
            </div>

            {/* Test Controls */}
            <div style={{ marginBottom: '20px' }}>
                <h4>Test Controls</h4>
                <button 
                    onClick={handleTestCall}
                    disabled={!isConnected}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: !isConnected ? '#ccc' : '#e83e8c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: !isConnected ? 'not-allowed' : 'pointer',
                        marginRight: '10px'
                    }}
                >
                    Test Incoming Call
                </button>
                <input
                    type="text"
                    placeholder="Custom message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        marginRight: '10px',
                        width: '200px'
                    }}
                />
                <button 
                    onClick={handleEmitMessage}
                    disabled={!isConnected || !message.trim()}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: !isConnected || !message.trim() ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: !isConnected || !message.trim() ? 'not-allowed' : 'pointer'
                    }}
                >
                    Send Message
                </button>
            </div>

            {/* Messages */}
            <div style={{ marginBottom: '20px' }}>
                <h4>Real-time Messages</h4>
                <div style={{
                    height: '300px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '10px',
                    overflowY: 'auto',
                    backgroundColor: '#f8f9fa'
                }}>
                    {messages.length === 0 ? (
                        <p style={{ color: '#666', textAlign: 'center' }}>
                            No messages yet. Connect to see real-time events.
                        </p>
                    ) : (
                        messages.map(msg => (
                            <div key={msg.id} style={{
                                padding: '8px',
                                marginBottom: '8px',
                                backgroundColor: 'white',
                                border: '1px solid #e9ecef',
                                borderRadius: '4px'
                            }}>
                                <div style={{ fontWeight: 'bold', color: '#007bff' }}>
                                    {msg.type} - {msg.timestamp}
                                </div>
                                <pre style={{ 
                                    margin: '4px 0 0 0', 
                                    fontSize: '12px',
                                    color: '#666',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {JSON.stringify(msg.data, null, 2)}
                                </pre>
                            </div>
                        ))
                    )}
                </div>
                <button 
                    onClick={() => setMessages([])}
                    style={{
                        padding: '5px 10px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                    }}
                >
                    Clear Messages
                </button>
            </div>
        </div>
    );
}

export default SocketTest;
