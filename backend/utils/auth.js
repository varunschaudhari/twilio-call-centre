const jwt = require('jsonwebtoken');

// JWT Secret - In production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Generate JWT token
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

// Password utilities (for future use if needed)
// Note: Install bcryptjs if you need password hashing functionality
// const hashPassword = async (password) => {
//     const bcrypt = require('bcryptjs');
//     const saltRounds = 10;
//     return await bcrypt.hash(password, saltRounds);
// };

// const comparePassword = async (password, hashedPassword) => {
//     const bcrypt = require('bcryptjs');
//     return await bcrypt.compare(password, hashedPassword);
// };

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            error: 'Access token required',
            message: 'Please provide a valid authentication token'
        });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            error: 'Invalid token',
            message: 'The provided token is invalid or expired'
        });
    }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = verifyToken(token);
            req.user = decoded;
        } catch (error) {
            // Token is invalid but we don't fail the request
            console.log('Invalid optional token:', error.message);
        }
    }
    next();
};

module.exports = {
    generateToken,
    verifyToken,
    authenticateToken,
    optionalAuth,
    JWT_SECRET,
    JWT_EXPIRES_IN
};
