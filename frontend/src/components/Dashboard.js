import React, { useEffect } from 'react';
import { useImmer } from 'use-immer';
import { dashboardAPI, callAPI, agentAPI } from '../services/api';
import { useApi, useApiCall } from '../hooks/useApi';

function Dashboard() {
    const [state, updateState] = useImmer({
        stats: null,
        calls: [],
        agents: [],
        filters: {
            status: 'all',
            dateRange: 'today'
        }
    });

    // Using useApiCall for specific API calls
    const { 
        loading: statsLoading, 
        error: statsError, 
        execute: fetchStats 
    } = useApiCall(dashboardAPI.getStats);

    const { 
        loading: callsLoading, 
        error: callsError, 
        execute: fetchCalls 
    } = useApiCall(callAPI.getCalls);

    const { 
        loading: agentsLoading, 
        error: agentsError, 
        execute: fetchAgents 
    } = useApiCall(agentAPI.getAgents);

    // Using useApi for general API operations
    const { executeRequest } = useApi();

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // Fetch all data in parallel
            const [statsData, callsData, agentsData] = await Promise.all([
                fetchStats(),
                fetchCalls({ status: state.filters.status }),
                fetchAgents()
            ]);

            // Update state with fetched data
            updateState(draft => {
                draft.stats = statsData;
                draft.calls = callsData;
                draft.agents = agentsData;
            });
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    };

    const handleCallAction = async (callId, action) => {
        try {
            let response;
            
            switch (action) {
                case 'end':
                    response = await executeRequest(() => callAPI.endCall(callId));
                    break;
                case 'transfer':
                    response = await executeRequest(() => 
                        callAPI.transferCall(callId, { agentId: 'agent-123' })
                    );
                    break;
                default:
                    throw new Error('Invalid action');
            }

            // Refresh calls data after action
            await fetchCalls({ status: state.filters.status });
            
            console.log(`${action} call successful:`, response);
        } catch (error) {
            console.error(`Failed to ${action} call:`, error);
        }
    };

    const handleAgentStatusChange = async (agentId, newStatus) => {
        try {
            await executeRequest(() => 
                agentAPI.updateAgentStatus(agentId, newStatus)
            );
            
            // Refresh agents data
            await fetchAgents();
            
            console.log(`Agent ${agentId} status updated to ${newStatus}`);
        } catch (error) {
            console.error('Failed to update agent status:', error);
        }
    };

    const handleFilterChange = (filterType, value) => {
        updateState(draft => {
            draft.filters[filterType] = value;
        });
        
        // Reload data with new filters
        if (filterType === 'status') {
            fetchCalls({ status: value });
        }
    };

    if (statsLoading || callsLoading || agentsLoading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading dashboard data...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Call Center Dashboard</h1>
                <div className="dashboard-filters">
                    <select 
                        value={state.filters.status} 
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        <option value="all">All Calls</option>
                        <option value="active">Active Calls</option>
                        <option value="waiting">Waiting Calls</option>
                        <option value="completed">Completed Calls</option>
                    </select>
                </div>
            </div>

            {/* Stats Section */}
            {statsError ? (
                <div className="error-message">
                    <p>Failed to load stats: {statsError.message}</p>
                </div>
            ) : (
                <div className="stats-grid">
                    {state.stats && (
                        <>
                            <div className="stat-card">
                                <h3>Active Calls</h3>
                                <p className="stat-number">{state.stats.activeCalls}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Available Agents</h3>
                                <p className="stat-number">{state.stats.availableAgents}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Queue Length</h3>
                                <p className="stat-number">{state.stats.queueLength}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Avg Wait Time</h3>
                                <p className="stat-number">{state.stats.avgWaitTime}s</p>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Calls Section */}
            <div className="calls-section">
                <h2>Recent Calls</h2>
                {callsError ? (
                    <div className="error-message">
                        <p>Failed to load calls: {callsError.message}</p>
                    </div>
                ) : (
                    <div className="calls-list">
                        {state.calls.map(call => (
                            <div key={call.id} className="call-item">
                                <div className="call-info">
                                    <span className="call-id">{call.id}</span>
                                    <span className="call-status">{call.status}</span>
                                    <span className="call-duration">{call.duration}s</span>
                                </div>
                                <div className="call-actions">
                                    {call.status === 'active' && (
                                        <>
                                            <button 
                                                onClick={() => handleCallAction(call.id, 'end')}
                                                className="btn btn-danger"
                                            >
                                                End Call
                                            </button>
                                            <button 
                                                onClick={() => handleCallAction(call.id, 'transfer')}
                                                className="btn btn-warning"
                                            >
                                                Transfer
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Agents Section */}
            <div className="agents-section">
                <h2>Agents</h2>
                {agentsError ? (
                    <div className="error-message">
                        <p>Failed to load agents: {agentsError.message}</p>
                    </div>
                ) : (
                    <div className="agents-list">
                        {state.agents.map(agent => (
                            <div key={agent.id} className="agent-item">
                                <div className="agent-info">
                                    <span className="agent-name">{agent.name}</span>
                                    <span className={`agent-status ${agent.status}`}>
                                        {agent.status}
                                    </span>
                                </div>
                                <div className="agent-actions">
                                    <select 
                                        value={agent.status}
                                        onChange={(e) => handleAgentStatusChange(agent.id, e.target.value)}
                                    >
                                        <option value="available">Available</option>
                                        <option value="busy">Busy</option>
                                        <option value="offline">Offline</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
