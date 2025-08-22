import { useEffect, useState, useCallback, useRef } from 'react';
import socketManager from '../utils/socketio';

export const useSocket = (autoConnect = true) => {
    const [isConnected, setIsConnected] = useState(false);
    const [socketId, setSocketId] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const eventListenersRef = useRef(new Map());

    // Connect to socket
    const connect = useCallback((url) => {
        try {
            socketManager.connect(url);
        } catch (error) {
            console.error('Failed to connect socket:', error);
        }
    }, []);

    // Disconnect socket
    const disconnect = useCallback(() => {
        socketManager.disconnect();
    }, []);

    // Emit event
    const emit = useCallback((event, data) => {
        return socketManager.emit(event, data);
    }, []);

    // Join room
    const joinRoom = useCallback((roomName) => {
        return socketManager.joinRoom(roomName);
    }, []);

    // Leave room
    const leaveRoom = useCallback((roomName) => {
        return socketManager.leaveRoom(roomName);
    }, []);

    // Add event listener
    const on = useCallback((event, callback) => {
        // Store the callback reference for cleanup
        if (!eventListenersRef.current.has(event)) {
            eventListenersRef.current.set(event, []);
        }
        eventListenersRef.current.get(event).push(callback);
        
        // Add listener to socket manager
        socketManager.on(event, callback);
    }, []);

    // Remove event listener
    const off = useCallback((event, callback) => {
        socketManager.off(event, callback);
        
        // Remove from our ref
        if (eventListenersRef.current.has(event)) {
            const listeners = eventListenersRef.current.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }, []);

    // Call center specific methods
    const joinCallCenter = useCallback((agentId) => {
        return socketManager.joinCallCenter(agentId);
    }, []);

    const updateAgentStatus = useCallback((agentId, status) => {
        return socketManager.updateAgentStatus(agentId, status);
    }, []);

    const handleIncomingCall = useCallback((callData) => {
        return socketManager.handleIncomingCall(callData);
    }, []);

    const endCall = useCallback((callId) => {
        return socketManager.endCall(callId);
    }, []);

    const transferCall = useCallback((callId, targetAgentId) => {
        return socketManager.transferCall(callId, targetAgentId);
    }, []);

    // Get connection status
    const getStatus = useCallback(() => {
        return socketManager.getConnectionStatus();
    }, []);

    // Update connection status
    const updateConnectionStatus = useCallback(() => {
        const status = socketManager.getConnectionStatus();
        setIsConnected(status.isConnected);
        setSocketId(status.socketId);
        setConnectionStatus(status.isConnected ? 'connected' : 'disconnected');
    }, []);

    // Setup connection status listeners
    useEffect(() => {
        const handleConnect = () => {
            updateConnectionStatus();
        };

        const handleDisconnect = () => {
            updateConnectionStatus();
        };

        // Listen for connection status changes
        socketManager.on('connect', handleConnect);
        socketManager.on('disconnect', handleDisconnect);

        // Initial status check
        updateConnectionStatus();

        // Auto-connect if enabled
        if (autoConnect && !socketManager.isConnected) {
            connect();
        }

        // Cleanup function
        return () => {
            socketManager.off('connect', handleConnect);
            socketManager.off('disconnect', handleDisconnect);
            
            // Clean up all event listeners
            eventListenersRef.current.forEach((listeners, event) => {
                listeners.forEach(callback => {
                    socketManager.off(event, callback);
                });
            });
            eventListenersRef.current.clear();
        };
    }, [autoConnect, connect, updateConnectionStatus]);

    return {
        // Connection state
        isConnected,
        socketId,
        connectionStatus,
        
        // Connection methods
        connect,
        disconnect,
        getStatus,
        
        // Event methods
        emit,
        on,
        off,
        
        // Room methods
        joinRoom,
        leaveRoom,
        
        // Call center methods
        joinCallCenter,
        updateAgentStatus,
        handleIncomingCall,
        endCall,
        transferCall,
        
        // Socket manager instance
        socketManager
    };
};

// Hook for specific call center events
export const useCallCenterSocket = () => {
    const socket = useSocket();
    const [incomingCalls, setIncomingCalls] = useState([]);
    const [activeCalls, setActiveCalls] = useState([]);
    const [agentStatus, setAgentStatus] = useState('offline');
    const [queueStatus, setQueueStatus] = useState({ length: 0, waitTime: 0 });
    const [dashboardStats, setDashboardStats] = useState({});

    useEffect(() => {
        // Listen for incoming calls
        socket.on('call-incoming', (data) => {
            setIncomingCalls(prev => [...prev, data]);
        });

        // Listen for call ended
        socket.on('call-ended', (data) => {
            setActiveCalls(prev => prev.filter(call => call.id !== data.callId));
            setIncomingCalls(prev => prev.filter(call => call.id !== data.callId));
        });

        // Listen for call transferred
        socket.on('call-transferred', (data) => {
            setActiveCalls(prev => prev.map(call => 
                call.id === data.callId ? { ...call, ...data } : call
            ));
        });

        // Listen for agent status updates
        socket.on('agent-status-updated', (data) => {
            setAgentStatus(data.status);
        });

        // Listen for queue updates
        socket.on('queue-updated', (data) => {
            setQueueStatus(data);
        });

        // Listen for dashboard stats updates
        socket.on('dashboard-stats-updated', (data) => {
            setDashboardStats(data);
        });

        return () => {
            // Cleanup is handled by useSocket hook
        };
    }, [socket]);

    return {
        ...socket,
        incomingCalls,
        activeCalls,
        agentStatus,
        queueStatus,
        dashboardStats,
        
        // Helper methods
        acceptCall: (callId) => {
            socket.handleIncomingCall({ callId, action: 'accept' });
            setIncomingCalls(prev => prev.filter(call => call.id !== callId));
            setActiveCalls(prev => [...prev, { id: callId, status: 'active' }]);
        },
        
        rejectCall: (callId) => {
            socket.handleIncomingCall({ callId, action: 'reject' });
            setIncomingCalls(prev => prev.filter(call => call.id !== callId));
        },
        
        setAgentAvailable: () => {
            socket.updateAgentStatus('current', 'available');
        },
        
        setAgentBusy: () => {
            socket.updateAgentStatus('current', 'busy');
        },
        
        setAgentOffline: () => {
            socket.updateAgentStatus('current', 'offline');
        }
    };
};
