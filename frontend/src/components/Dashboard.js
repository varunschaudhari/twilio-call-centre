import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

function Dashboard() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Call Center Dashboard</h1>
                <div className="user-info">
                    <span>Welcome, {user?.phoneNumber || 'User'}</span>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </div>
            
            <div className="dashboard-content">
                <div className="dashboard-card">
                    <h3>User Information</h3>
                    <div className="user-details">
                        <p><strong>Phone Number:</strong> {user?.phoneNumber || 'N/A'}</p>
                        <p><strong>Verified:</strong> {user?.verified ? 'Yes' : 'No'}</p>
                        <p><strong>Verified At:</strong> {user?.verifiedAt ? new Date(user.verifiedAt).toLocaleString() : 'N/A'}</p>
                    </div>
                </div>

                <div className="dashboard-card">
                    <h3>Authentication Status</h3>
                    <div className="auth-status">
                        <p><strong>JWT Token:</strong> Present</p>
                        <p><strong>Session:</strong> Active</p>
                        <p><strong>Last Login:</strong> {user?.verifiedAt ? new Date(user.verifiedAt).toLocaleString() : 'N/A'}</p>
                    </div>
                </div>

                <div className="dashboard-card">
                    <h3>Quick Actions</h3>
                    <div className="quick-actions">
                        <button className="action-btn">View Calls</button>
                        <button className="action-btn">Agent Status</button>
                        <button className="action-btn">Reports</button>
                        <button className="action-btn">Settings</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
