import { io } from 'socket.io-client';
import { getToken } from './auth';

class SocketManager {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.eventListeners = new Map();
    }

    // Initialize socket connection
    connect(url = 'http://localhost:3000') {
        if (this.socket && this.isConnected) {
            console.log('Socket already connected');
            return this.socket;
        }

        try {
            const token = getToken();
            this.socket = io(url, {
                transports: ['websocket', 'polling'],
                timeout: 20000,
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: this.reconnectDelay,
                reconnectionDelayMax: 5000,
                maxReconnectionAttempts: this.maxReconnectAttempts,
                autoConnect: true,
                auth: {
                    token: token
                }
            });

            this.setupEventListeners();
            return this.socket;
        } catch (error) {
            console.error('Failed to create socket connection:', error);
            throw error;
        }
    }

    // Setup socket event listeners
    setupEventListeners() {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('✅ Socket connected:', this.socket.id);
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.emit('client-ready', { timestamp: new Date().toISOString() });
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            this.isConnected = false;

            if (reason === 'io server disconnect') {
                // Server disconnected us, try to reconnect
                this.socket.connect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('🔌 Socket connection error:', error);
            this.reconnectAttempts++;

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('Max reconnection attempts reached');
            }
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
            this.isConnected = true;
            this.reconnectAttempts = 0;
        });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
            console.log('🔄 Socket reconnection attempt:', attemptNumber);
        });

        this.socket.on('reconnect_error', (error) => {
            console.error('🔄 Socket reconnection error:', error);
        });

        this.socket.on('reconnect_failed', () => {
            console.error('🔄 Socket reconnection failed');
        });

        // Custom events
        this.socket.on('welcome', (data) => {
            console.log('👋 Welcome message:', data);
            this.triggerEventListeners('welcome', data);
        });

        this.socket.on('room-joined', (data) => {
            console.log('🚪 Room joined:', data);
            this.triggerEventListeners('room-joined', data);
        });

        this.socket.on('room-left', (data) => {
            console.log('🚪 Room left:', data);
            this.triggerEventListeners('room-left', data);
        });

        // Call center specific events
        this.socket.on('call-incoming', (data) => {
            console.log('📞 Incoming call:', data);
            this.triggerEventListeners('call-incoming', data);
        });

        this.socket.on('call-ended', (data) => {
            console.log('📞 Call ended:', data);
            this.triggerEventListeners('call-ended', data);
        });

        this.socket.on('call-transferred', (data) => {
            console.log('📞 Call transferred:', data);
            this.triggerEventListeners('call-transferred', data);
        });

        this.socket.on('agent-status-updated', (data) => {
            console.log('👤 Agent status updated:', data);
            this.triggerEventListeners('agent-status-updated', data);
        });

        this.socket.on('queue-updated', (data) => {
            console.log('📋 Queue updated:', data);
            this.triggerEventListeners('queue-updated', data);
        });

        this.socket.on('dashboard-stats-updated', (data) => {
            console.log('📊 Dashboard stats updated:', data);
            this.triggerEventListeners('dashboard-stats-updated', data);
        });

        // Error handling
        this.socket.on('error', (error) => {
            console.error('❌ Socket error:', error);
            this.triggerEventListeners('error', error);
        });
    }

    // Emit event to server
    emit(event, data) {
        if (!this.socket || !this.isConnected) {
            console.warn('Socket not connected, cannot emit:', event);
            return false;
        }

        try {
            this.socket.emit(event, data);
            console.log('📤 Emitted:', event, data);
            return true;
        } catch (error) {
            console.error('Failed to emit event:', event, error);
            return false;
        }
    }

    // Join a room
    joinRoom(roomName) {
        return this.emit('join-room', roomName);
    }

    // Leave a room
    leaveRoom(roomName) {
        return this.emit('leave-room', roomName);
    }

    // Join call center room
    joinCallCenter(agentId) {
        return this.emit('join-call-center', { agentId, timestamp: new Date().toISOString() });
    }

    // Update agent status
    updateAgentStatus(agentId, status) {
        return this.emit('update-agent-status', { agentId, status, timestamp: new Date().toISOString() });
    }

    // Handle incoming call
    handleIncomingCall(callData) {
        return this.emit('handle-incoming-call', callData);
    }

    // End call
    endCall(callId) {
        return this.emit('end-call', { callId, timestamp: new Date().toISOString() });
    }

    // Transfer call
    transferCall(callId, targetAgentId) {
        return this.emit('transfer-call', { callId, targetAgentId, timestamp: new Date().toISOString() });
    }

    // Add event listener
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    // Remove event listener
    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    // Trigger event listeners
    triggerEventListeners(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in event listener:', event, error);
                }
            });
        }
    }

    // Get connection status
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            socketId: this.socket?.id,
            reconnectAttempts: this.reconnectAttempts
        };
    }

    // Disconnect socket
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.isConnected = false;
            this.eventListeners.clear();
            console.log('🔌 Socket disconnected');
        }
    }

    // Reconnect socket
    reconnect() {
        if (this.socket) {
            this.socket.connect();
        }
    }
}

// Create singleton instance
const socketManager = new SocketManager();

// Export singleton instance and class
export default socketManager;
export { SocketManager };

// Convenience functions
export const connectSocket = (url) => socketManager.connect(url);
export const disconnectSocket = () => socketManager.disconnect();
export const emitEvent = (event, data) => socketManager.emit(event, data);
export const joinRoom = (roomName) => socketManager.joinRoom(roomName);
export const leaveRoom = (roomName) => socketManager.leaveRoom(roomName);
export const getConnectionStatus = () => socketManager.getConnectionStatus();
