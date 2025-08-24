const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const twilioConfig = require('./config');
const twilioClient = require('./twilio-client');
const { generateToken, authenticateToken, optionalAuth, JWT_SECRET } = require('./utils/auth');
const jwt = require('jsonwebtoken');
const client = new twilioClient();


const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
    res.json({
        message: 'Twilio Call Center Backend Server',
        status: 'running',
        timestamp: new Date().toISOString()
    });
});

app.post('/login', async (req, res) => {
    const { to } = req.body;

    // Validate phone number
    if (!to) {
        return res.status(400).json({
            error: 'Phone number is required',
            message: 'Please provide a phone number in the request body'
        });
    }

    // Basic phone number validation (E.164 format)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(to)) {
        return res.status(400).json({
            error: 'Invalid phone number format',
            message: 'Phone number must be in E.164 format (e.g., +1234567890)'
        });
    }

    try {
        const response = await client.sendVerifySMS(to, 'sms');
        console.log('SMS verification sent to:', to, 'Status:', response.status);

        // Create a safe response object without circular references
        const safeResponse = {
            status: response.status,
            to: response.to,
            sid: response.sid,
            channel: response.channel,
            dateCreated: response.dateCreated,
            dateUpdated: response.dateUpdated
        };

        res.json(safeResponse);
    } catch (error) {
        console.error('Error sending SMS verification:', error);

        // Handle circular reference errors
        if (error.message && error.message.includes('circular')) {
            res.status(500).json({
                error: 'Failed to send SMS verification',
                message: 'Internal server error - circular reference detected'
            });
        } else {
            res.status(500).json({
                error: 'Failed to send SMS verification',
                message: error.message
            });
        }
    }
});

app.post('/verify', async (req, res) => {
    const { to, code } = req.body;

    // Validate parameters
    if (!to || !code) {
        return res.status(400).json({
            error: 'Missing required parameters',
            message: 'Please provide both "to" (phone number) and "code" (OTP) in the request body'
        });
    }

    // Basic phone number validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(to)) {
        return res.status(400).json({
            error: 'Invalid phone number format',
            message: 'Phone number must be in E.164 format (e.g., +1234567890)'
        });
    }

    // Basic OTP validation
    if (!/^\d{4,8}$/.test(code)) {
        return res.status(400).json({
            error: 'Invalid OTP format',
            message: 'OTP must be 4-8 digits'
        });
    }

    try {
        const response = await client.verifyOTP(to, code);
        console.log('OTP verification for:', to, 'Status:', response.status);

        // If OTP is approved, generate JWT token
        if (response.status === 'approved') {
            const tokenPayload = {
                phoneNumber: to,
                verified: true,
                verifiedAt: new Date().toISOString()
            };

            const token = generateToken(tokenPayload);

            // Create a safe response object without circular references
            const safeResponse = {
                status: response.status,
                to: response.to,
                sid: response.sid,
                valid: response.valid,
                dateCreated: response.dateCreated,
                dateUpdated: response.dateUpdated,
                token,
                user: {
                    phoneNumber: to,
                    verified: true
                }
            };

            res.json(safeResponse);
        } else {
            // Create a safe response object for non-approved status
            const safeResponse = {
                status: response.status,
                to: response.to,
                sid: response.sid,
                valid: response.valid,
                dateCreated: response.dateCreated,
                dateUpdated: response.dateUpdated
            };

            res.json(safeResponse);
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);

        // Handle circular reference errors
        if (error.message && error.message.includes('circular')) {
            res.status(500).json({
                error: 'Failed to verify OTP',
                message: 'Internal server error - circular reference detected'
            });
        } else {
            res.status(500).json({
                error: 'Failed to verify OTP',
                message: error.message
            });
        }
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        twilio: {
            configured: twilioConfig.isValid(),
            accountSid: twilioConfig.accountSid ? 'configured' : 'missing',
            phoneNumber: twilioConfig.phoneNumber,
            verifyService: twilioConfig.hasVerifyService() ? 'configured' : 'missing',
            tokenCredentials: twilioConfig.hasTokenCredentials() ? 'configured' : 'missing'
        }
    });
});

// Protected routes - require authentication
app.get('/api/profile', authenticateToken, (req, res) => {
    res.json({
        user: req.user,
        message: 'Profile retrieved successfully'
    });
});

// Refresh token endpoint
app.post('/api/refresh-token', authenticateToken, (req, res) => {
    try {
        // Generate new token with same payload but new expiration
        const newToken = generateToken({
            phoneNumber: req.user.phoneNumber,
            verified: req.user.verified,
            verifiedAt: req.user.verifiedAt
        });

        res.json({
            token: newToken,
            message: 'Token refreshed successfully'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to refresh token',
            message: error.message
        });
    }
});

// Logout endpoint (client-side token removal)
app.post('/api/logout', authenticateToken, (req, res) => {
    res.json({
        message: 'Logged out successfully'
    });
});

// Call center endpoints
app.post('/api/calls/accept', authenticateToken, (req, res) => {
    const { callId } = req.body;
    const agentId = req.user.phoneNumber;

    // Emit to all connected clients
    io.emit('call-accepted', { callId, agentId, timestamp: new Date().toISOString() });

    res.json({
        message: 'Call accepted',
        callId,
        agentId
    });
});

app.post('/api/calls/end', authenticateToken, (req, res) => {
    const { callId } = req.body;
    const agentId = req.user.phoneNumber;

    // Emit to all connected clients
    io.emit('call-ended', { callId, agentId, timestamp: new Date().toISOString() });

    res.json({
        message: 'Call ended',
        callId,
        agentId
    });
});

app.post('/api/calls/transfer', authenticateToken, (req, res) => {
    const { callId, target, reason } = req.body;
    const agentId = req.user.phoneNumber;

    // Emit to all connected clients
    io.emit('call-transferred', { callId, agentId, target, reason, timestamp: new Date().toISOString() });

    res.json({
        message: 'Call transferred',
        callId,
        agentId,
        target
    });
});

// Mock call queue endpoint
app.get('/api/calls/queue', authenticateToken, (req, res) => {
    // Mock queue data
    const mockQueue = [
        {
            id: 'call-1',
            from: '+1234567890',
            waitTime: 45,
            timestamp: new Date(Date.now() - 45000).toISOString()
        },
        {
            id: 'call-2',
            from: '+1987654321',
            waitTime: 120,
            timestamp: new Date(Date.now() - 120000).toISOString()
        }
    ];

    res.json({
        queue: mockQueue,
        total: mockQueue.length
    });
});

// Socket.IO connection handling with JWT authentication
io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
        // Allow connection but mark as unauthenticated
        socket.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.user = decoded;
        next();
    } catch (error) {
        // Allow connection but mark as unauthenticated
        socket.user = null;
        next();
    }
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id, socket.user ? `(Authenticated: ${socket.user.phoneNumber})` : '(Unauthenticated)');

    // Send welcome message
    socket.emit('welcome', {
        message: 'Connected to Twilio Call Center Server',
        socketId: socket.id,
        authenticated: !!socket.user,
        user: socket.user ? { phoneNumber: socket.user.phoneNumber } : null
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });

    // Handle custom events
    socket.on('join-room', (room) => {
        socket.join(room);
        console.log(`Client ${socket.id} joined room: ${room}`);
        socket.emit('room-joined', { room });
    });

    socket.on('leave-room', (room) => {
        socket.leave(room);
        console.log(`Client ${socket.id} left room: ${room}`);
        socket.emit('room-left', { room });
    });

    // Authenticated-only events
    socket.on('authenticated-event', (data) => {
        if (!socket.user) {
            socket.emit('error', { message: 'Authentication required' });
            return;
        }
        // Handle authenticated event
        socket.emit('authenticated-response', {
            message: 'Authenticated event processed',
            user: socket.user.phoneNumber
        });
    });

    // Call center events
    socket.on('update-agent-status', (data) => {
        console.log('Agent status updated:', socket.user?.phoneNumber, data.status);
        // Broadcast to all clients
        io.emit('agent-status-updated', {
            agentId: socket.user?.phoneNumber,
            status: data.status,
            timestamp: new Date().toISOString()
        });
    });

    socket.on('accept-call', (data) => {
        console.log('Call accepted:', data);
        io.emit('call-connected', {
            id: data.callId,
            from: '+1234567890', // Mock caller
            agentId: socket.user?.phoneNumber,
            timestamp: new Date().toISOString()
        });
    });

    socket.on('end-call', (data) => {
        console.log('Call ended:', data);
        io.emit('call-ended', {
            id: data.callId,
            agentId: socket.user?.phoneNumber,
            duration: Math.floor(Math.random() * 300) + 60, // Random duration 1-6 minutes
            timestamp: new Date().toISOString()
        });
    });

    // Simulate incoming calls for demo purposes
    if (socket.user) {
        // Send a mock incoming call after 5 seconds
        setTimeout(() => {
            socket.emit('call-incoming', {
                id: 'mock-call-' + Date.now(),
                from: '+1555123456',
                waitTime: 0,
                timestamp: new Date().toISOString()
            });
        }, 5000);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.IO server ready`);
    console.log(`🔧 Twilio configured: ${twilioConfig.isValid() ? 'Yes' : 'No'}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});
