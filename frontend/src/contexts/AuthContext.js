import React, { createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated, getUser, logout as logoutUser, refreshTokenIfNeeded } from '../utils/auth';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUserState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    // Initialize authentication state
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                if (isAuthenticated()) {
                    const userData = getUser();
                    setUserState(userData);
                    setAuthenticated(true);

                    // Try to refresh token if needed
                    await refreshTokenIfNeeded(authAPI);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                logout();
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // Login function
    const login = (token, userData) => {
        console.log('🔑 AuthContext login called with:', { token: !!token, userData });
        setUserState(userData);
        setAuthenticated(true);
        console.log('✅ AuthContext state updated - authenticated:', true);
    };

    // Logout function
    const logout = async () => {
        try {
            // Call logout API if authenticated
            if (authenticated) {
                await authAPI.logout();
            }
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // Clear local state regardless of API call success
            logoutUser();
            setUserState(null);
            setAuthenticated(false);
        }
    };

    // Update user data
    const updateUser = (userData) => {
        setUserState(userData);
    };

    // Check if user has specific permission (for future use)
    const hasPermission = (permission) => {
        if (!user) return false;
        // Add permission logic here when needed
        return true;
    };

    const value = {
        user,
        authenticated,
        loading,
        login,
        logout,
        updateUser,
        hasPermission
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
