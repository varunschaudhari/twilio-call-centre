import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors without JWT redirect
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Auth API endpoints (using Twilio SMS verification)
export const authAPI = {
  // Send SMS verification code
  sendVerification: (phoneNumber) => api.get('/login', {
    params: { to: phoneNumber }
  }),

  // Verify OTP code
  verifyOTP: (phoneNumber, code) => api.get('/verify', {
    params: { to: phoneNumber, code }
  }),
};

// Call management API endpoints (to be implemented in backend)
export const callAPI = {
  // Get all calls
  getCalls: (params = {}) => api.get('/calls', { params }),

  // Get specific call
  getCall: (callId) => api.get(`/calls/${callId}`),

  // Create new call
  createCall: (callData) => api.post('/calls', callData),

  // Update call status
  updateCallStatus: (callId, status) => api.patch(`/calls/${callId}/status`, { status }),

  // End call
  endCall: (callId) => api.post(`/calls/${callId}/end`),

  // Transfer call
  transferCall: (callId, transferData) => api.post(`/calls/${callId}/transfer`, transferData),

  // Get call history
  getCallHistory: (params = {}) => api.get('/calls/history', { params }),
};

// Agent management API endpoints (to be implemented in backend)
export const agentAPI = {
  // Get all agents
  getAgents: () => api.get('/agents'),

  // Get specific agent
  getAgent: (agentId) => api.get(`/agents/${agentId}`),

  // Update agent status
  updateAgentStatus: (agentId, status) => api.patch(`/agents/${agentId}/status`, { status }),

  // Get agent performance
  getAgentPerformance: (agentId, params = {}) => api.get(`/agents/${agentId}/performance`, { params }),

  // Get agent calls
  getAgentCalls: (agentId, params = {}) => api.get(`/agents/${agentId}/calls`, { params }),
};

// Dashboard API endpoints (to be implemented in backend)
export const dashboardAPI = {
  // Get dashboard stats
  getStats: () => api.get('/dashboard/stats'),

  // Get real-time metrics
  getMetrics: () => api.get('/dashboard/metrics'),

  // Get call queue status
  getQueueStatus: () => api.get('/dashboard/queue'),
};

// Twilio specific API endpoints
export const twilioAPI = {
  // Generate Twilio token
  generateToken: (identity) => api.post('/twilio/token', { identity }),

  // Get Twilio capabilities
  getCapabilities: () => api.get('/twilio/capabilities'),

  // Handle Twilio webhooks
  handleWebhook: (webhookData) => api.post('/twilio/webhook', webhookData),
};

// System API endpoints
export const systemAPI = {
  // Health check
  healthCheck: () => api.get('/health'),

  // Server status
  getStatus: () => api.get('/'),
};

// Utility functions
export const apiUtils = {
  // Handle API errors
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || error.response.data?.error || 'An error occurred',
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'No response from server. Please check your connection.',
        status: 0,
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        status: 0,
      };
    }
  },

  // Retry failed requests
  retryRequest: async (requestFn, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  },
};

export default api;
