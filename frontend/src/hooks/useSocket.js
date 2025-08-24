import { useState, useEffect } from 'react';
import { getToken } from '../utils/auth';
import { io } from 'socket.io-client';

export const useSocket = () => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);

    useEffect(() => {
        const token = getToken();

        if (!token) {
            console.log('No token available, skipping socket connection');
            return;
        }

        // Create socket connection
        const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:3000', {
            transports: ['websocket', 'polling'],
            timeout: 20000,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            autoConnect: true,
            auth: {
                token: token
            }
        });

        // Connection events
        newSocket.on('connect', () => {
            console.log('✅ Socket connected:', newSocket.id);
            setIsConnected(true);
            setConnectionError(null);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('🔌 Socket connection error:', error);
            setConnectionError(error.message);
            setIsConnected(false);
        });

        newSocket.on('reconnect', (attemptNumber) => {
            console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
            setIsConnected(true);
            setConnectionError(null);
        });

        newSocket.on('reconnect_error', (error) => {
            console.error('🔄 Socket reconnection error:', error);
            setConnectionError(error.message);
        });

        newSocket.on('reconnect_failed', () => {
            console.error('🔄 Socket reconnection failed');
            setConnectionError('Failed to reconnect to server');
        });

        // Welcome message
        newSocket.on('welcome', (data) => {
            console.log('👋 Welcome message:', data);
        });

        // Set socket instance
        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            console.log('🔌 Cleaning up socket connection');
            newSocket.disconnect();
        };
    }, []);

    // Emit function wrapper
    const emit = (event, data) => {
        if (socket && isConnected) {
            socket.emit(event, data);
            return true;
        } else {
            console.warn('Socket not connected, cannot emit:', event);
            return false;
        }
    };

    // Join room
    const joinRoom = (roomName) => {
        return emit('join-room', roomName);
    };

    // Leave room
    const leaveRoom = (roomName) => {
        return emit('leave-room', roomName);
    };

    // Update agent status
    const updateAgentStatus = (status) => {
        return emit('update-agent-status', { status });
    };

    // Accept call
    const acceptCall = (callId) => {
        return emit('accept-call', { callId });
    };

    // End call
    const endCall = (callId) => {
        return emit('end-call', { callId });
    };

    // Transfer call
    const transferCall = (callId, target, reason) => {
        return emit('transfer-call', { callId, target, reason });
    };

    // Toggle mute
    const toggleMute = (callId, muted) => {
        return emit('toggle-mute', { callId, muted });
    };

    // Toggle hold
    const toggleHold = (callId, onHold) => {
        return emit('toggle-hold', { callId, onHold });
    };

    return {
        socket,
        isConnected,
        connectionError,
        emit,
        joinRoom,
        leaveRoom,
        updateAgentStatus,
        acceptCall,
        endCall,
        transferCall,
        toggleMute,
        toggleHold
    };
};
