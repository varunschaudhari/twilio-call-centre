const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const twilioConfig = require('./config');
const twilioClient = require('./twilio-client');
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

app.get('/login', async (req, res) => {
    const { to } = req.query;
    const response = await client.sendVerifySMS("+919405769103", 'sms');
    console.log(response);
    res.json(response);
});

app.get('/verify', async (req, res) => {
    const { to, code } = req.query;
    const response = await client.verifyOTP("+919405769103", code);
    console.log(response);
    res.json(response);
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

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send welcome message
    socket.emit('welcome', {
        message: 'Connected to Twilio Call Center Server',
        socketId: socket.id
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
