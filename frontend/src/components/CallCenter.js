import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../hooks/useSocket';
import ApiTest from './ApiTest';
import SocketTest from './SocketTest';
import './CallCenter.css';

function CallCenter() {
    const { user, logout } = useAuth();
    const { socket, isConnected } = useSocket();

    const [state, setState] = useState({
        agentStatus: 'available',
        agentName: user?.phoneNumber || 'Agent',
        currentCall: null,
        callQueue: [],
        recentCalls: [],
        isMuted: false,
        isOnHold: false,
        callDuration: 0,
        showTransferModal: false,
        transferTarget: '',
        transferReason: '',
        activeTab: 'dashboard' // dashboard, apiTest, socketTest
    });

    // Timer for call duration
    useEffect(() => {
        let interval;
        if (state.currentCall && state.agentStatus === 'busy') {
            interval = setInterval(() => {
                setState(prev => ({
                    ...prev,
                    callDuration: prev.callDuration + 1
                }));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [state.currentCall, state.agentStatus]);

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('call-incoming', (data) => {
            setState(prev => ({
                ...prev,
                callQueue: [...prev.callQueue, data]
            }));
        });

        socket.on('call-connected', (data) => {
            setState(prev => ({
                ...prev,
                currentCall: data,
                agentStatus: 'busy',
                callQueue: prev.callQueue.filter(call => call.id !== data.id),
                callDuration: 0
            }));
        });

        socket.on('call-ended', (data) => {
            setState(prev => ({
                ...prev,
                currentCall: null,
                agentStatus: 'available',
                callDuration: 0,
                recentCalls: [data, ...prev.recentCalls.slice(0, 9)]
            }));
        });

        return () => {
            socket.off('call-incoming');
            socket.off('call-connected');
            socket.off('call-ended');
        };
    }, [socket]);

    const handleCallAction = (action) => {
        if (!state.currentCall) return;

        switch (action) {
            case 'end':
                socket?.emit('end-call', { callId: state.currentCall.id });
                break;
            case 'mute':
                setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
                break;
            case 'hold':
                setState(prev => ({ ...prev, isOnHold: !prev.isOnHold }));
                break;
            default:
                break;
        }
    };

    const handleStatusChange = (newStatus) => {
        setState(prev => ({ ...prev, agentStatus: newStatus }));
        socket?.emit('update-agent-status', { status: newStatus });
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleTabChange = (tab) => {
        setState(prev => ({ ...prev, activeTab: tab }));
    };

    return (
        <div className="call-center">
            {/* Header */}
            <div className="call-center-header">
                <div className="header-left">
                    <h1>Call Center Dashboard</h1>
                    <div className="connection-status">
                        <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </div>
                </div>

                <div className="header-right">
                    <div className="header-tabs" style={{ display: 'none' }}>
                        <button
                            onClick={() => handleTabChange('dashboard')}
                            className={`tab-btn ${state.activeTab === 'dashboard' ? 'active' : ''}`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => handleTabChange('apiTest')}
                            className={`tab-btn ${state.activeTab === 'apiTest' ? 'active' : ''}`}
                        >
                            API Test
                        </button>
                        <button
                            onClick={() => handleTabChange('socketTest')}
                            className={`tab-btn ${state.activeTab === 'socketTest' ? 'active' : ''}`}
                        >
                            Socket Test
                        </button>
                    </div>
                    <div className="agent-info">
                        <span className="agent-name">{state.agentName}</span>
                        <span className={`agent-status ${state.agentStatus}`}>
                            {state.agentStatus.charAt(0).toUpperCase() + state.agentStatus.slice(1)}
                        </span>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </div>

            <div className="call-center-content">
                {/* Tab Content */}
                {state.activeTab === 'dashboard' && (
                    <>
                        {/* Main Call Interface */}
                        <div className="main-panel">
                            {state.currentCall ? (
                                <div className="current-call">
                                    <div className="call-info">
                                        <h2>Active Call</h2>
                                        <div className="caller-info">
                                            <span className="caller-number">{state.currentCall.from}</span>
                                            <span className="call-duration">{formatDuration(state.callDuration)}</span>
                                        </div>
                                        {/* Call action buttons are hidden as requested */}
                                        <div className="call-actions" style={{ display: 'none' }}>
                                            <button
                                                onClick={() => handleCallAction('mute')}
                                                className={`action-btn ${state.isMuted ? 'active' : ''}`}
                                            >
                                                {state.isMuted ? 'Unmute' : 'Mute'}
                                            </button>
                                            <button
                                                onClick={() => handleCallAction('hold')}
                                                className={`action-btn ${state.isOnHold ? 'active' : ''}`}
                                            >
                                                {state.isOnHold ? 'Resume' : 'Hold'}
                                            </button>
                                            <button
                                                onClick={() => handleCallAction('end')}
                                                className="action-btn end-call"
                                            >
                                                End Call
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="no-call">
                                    <div className="no-call-content">
                                        <div className="phone-icon">📞</div>
                                        <h2>Ready for Calls</h2>
                                        <p>You are currently available to receive calls</p>
                                        {/* Status control buttons are hidden as requested */}
                                        <div className="status-controls" style={{ display: 'none' }}>
                                            <button
                                                onClick={() => handleStatusChange('available')}
                                                className={`status-btn ${state.agentStatus === 'available' ? 'active' : ''}`}
                                            >
                                                Available
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange('busy')}
                                                className={`status-btn ${state.agentStatus === 'busy' ? 'active' : ''}`}
                                            >
                                                Busy
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange('break')}
                                                className={`status-btn ${state.agentStatus === 'break' ? 'active' : ''}`}
                                            >
                                                Break
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange('offline')}
                                                className={`status-btn ${state.agentStatus === 'offline' ? 'active' : ''}`}
                                            >
                                                Offline
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Side Panel */}
                        <div className="side-panel">
                            <div className="queue-section">
                                <h3>Call Queue ({state.callQueue.length})</h3>
                                {state.callQueue.length > 0 ? (
                                    <div className="queue-list">
                                        {state.callQueue.map((call) => (
                                            <div key={call.id} className="queue-item">
                                                <div className="queue-info">
                                                    <span className="caller">{call.from}</span>
                                                    <span className="wait-time">{call.waitTime || 0}s</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-queue">No calls in queue</p>
                                )}
                            </div>

                            <div className="recent-calls-section">
                                <h3>Recent Calls</h3>
                                <div className="recent-calls-list">
                                    {state.recentCalls.map((call) => (
                                        <div key={call.id} className="recent-call-item">
                                            <div className="call-details">
                                                <span className="caller">{call.from}</span>
                                                <span className="call-status">{call.status}</span>
                                                <span className="call-duration">{formatDuration(call.duration || 0)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* API Test Tab */}
                {state.activeTab === 'apiTest' && (
                    <div className="test-tab-content">
                        <ApiTest />
                    </div>
                )}

                {/* Socket Test Tab */}
                {state.activeTab === 'socketTest' && (
                    <div className="test-tab-content">
                        <SocketTest />
                    </div>
                )}
            </div>
        </div>
    );
}

export default CallCenter;
