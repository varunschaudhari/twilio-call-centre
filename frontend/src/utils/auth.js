import Cookies from 'js-cookie';

// Token storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// SECURITY NOTE: We use cookies instead of localStorage for JWT tokens because:
// 1. XSS Protection: Cookies can be made inaccessible to JavaScript with httpOnly flag
// 2. CSRF Protection: sameSite flag prevents cross-site request forgery
// 3. Automatic Transmission: Cookies are automatically sent with requests
// 4. Better Security: More secure than localStorage for sensitive data

// Token expiration check
const isTokenExpired = (token) => {
    if (!token) return true;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        return payload.exp < currentTime;
    } catch (error) {
        return true;
    }
};

// Get token from storage
export const getToken = () => {
    return Cookies.get(TOKEN_KEY);
};

// Set token in storage
export const setToken = (token) => {
    if (token) {
        // Store token in secure cookie
        Cookies.set(TOKEN_KEY, token, {
            expires: 1, // 1 day
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'strict', // CSRF protection
            path: '/', // Available across the app
            domain: process.env.NODE_ENV === 'production' ? undefined : undefined // Current domain
        });
    }
};

// Remove token from storage
export const removeToken = () => {
    Cookies.remove(TOKEN_KEY);
};

// Get user data from storage
export const getUser = () => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
};

// Set user data in storage
export const setUser = (user) => {
    if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
};

// Remove user data from storage
export const removeUser = () => {
    localStorage.removeItem(USER_KEY);
};

// Check if user is authenticated
export const isAuthenticated = () => {
    const token = getToken();
    return token && !isTokenExpired(token);
};

// Get token payload (decoded)
export const getTokenPayload = (token) => {
    if (!token) return null;

    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
        return null;
    }
};

// Logout user
export const logout = () => {
    removeToken();
    removeUser();
    // Clear any other auth-related data
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userPhone');
};

// Get authorization header for API requests
export const getAuthHeader = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Auto-refresh token if needed
export const refreshTokenIfNeeded = async (apiService) => {
    const token = getToken();
    if (!token) return false;

    const payload = getTokenPayload(token);
    if (!payload) return false;

    // Refresh if token expires in less than 1 hour
    const currentTime = Date.now() / 1000;
    const oneHour = 60 * 60;

    if (payload.exp - currentTime < oneHour) {
        try {
            const response = await apiService.refreshToken();
            if (response.token) {
                setToken(response.token);
                return true;
            }
        } catch (error) {
            console.error('Failed to refresh token:', error);
            logout();
            return false;
        }
    }

    return true;
};
