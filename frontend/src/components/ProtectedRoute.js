import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children, fallback = null }) => {
    const { authenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!authenticated) {
        if (fallback) {
            return fallback;
        }

        // Redirect to login page
        window.location.href = '/login';
        return null;
    }

    return children;
};

export default ProtectedRoute;
