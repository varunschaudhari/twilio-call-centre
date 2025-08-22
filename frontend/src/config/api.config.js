// API Configuration
export const API_CONFIG = {
  // Base URL for API requests
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',

  // Request timeout in milliseconds
  TIMEOUT: 10000,

  // Retry configuration
  RETRY: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
  },

  // Auth configuration (using phone number instead of JWT)
  AUTH: {
    PHONE_KEY: 'userPhone',
    AUTHENTICATED_KEY: 'isAuthenticated',
  },

  // API endpoints
  ENDPOINTS: {
    AUTH: {
      SEND_VERIFICATION: '/login',
      VERIFY_OTP: '/verify',
    },
    CALLS: {
      BASE: '/calls',
      HISTORY: '/calls/history',
      STATUS: (id) => `/calls/${id}/status`,
      END: (id) => `/calls/${id}/end`,
      TRANSFER: (id) => `/calls/${id}/transfer`,
    },
    AGENTS: {
      BASE: '/agents',
      STATUS: (id) => `/agents/${id}/status`,
      PERFORMANCE: (id) => `/agents/${id}/performance`,
      CALLS: (id) => `/agents/${id}/calls`,
    },
    DASHBOARD: {
      STATS: '/dashboard/stats',
      METRICS: '/dashboard/metrics',
      QUEUE: '/dashboard/queue',
    },
    TWILIO: {
      TOKEN: '/twilio/token',
      CAPABILITIES: '/twilio/capabilities',
      WEBHOOK: '/twilio/webhook',
    },
    SYSTEM: {
      HEALTH: '/health',
      STATUS: '/',
    },
  },

  // Error messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    TIMEOUT_ERROR: 'Request timeout. Please try again.',
    UNAUTHORIZED: 'Unauthorized. Please login again.',
    FORBIDDEN: 'Access denied.',
    NOT_FOUND: 'Resource not found.',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNKNOWN_ERROR: 'An unexpected error occurred.',
    INVALID_PHONE: 'Please enter a valid phone number.',
    INVALID_OTP: 'Please enter a valid OTP code.',
  },
};

// Environment configuration
export const ENV_CONFIG = {
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',

  // Feature flags
  FEATURES: {
    ENABLE_WEBSOCKETS: process.env.REACT_APP_ENABLE_WEBSOCKETS === 'true',
    ENABLE_PUSH_NOTIFICATIONS: process.env.REACT_APP_ENABLE_PUSH_NOTIFICATIONS === 'true',
    ENABLE_DEBUG_LOGGING: process.env.REACT_APP_ENABLE_DEBUG_LOGGING === 'true',
  },

  // App info
  APP: {
    NAME: process.env.REACT_APP_APP_NAME || 'Twilio Call Center',
    VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  },
};

// Twilio configuration
export const TWILIO_CONFIG = {
  ACCOUNT_SID: process.env.REACT_APP_TWILIO_ACCOUNT_SID,
  AUTH_TOKEN: process.env.REACT_APP_TWILIO_AUTH_TOKEN,

  // Twilio Voice configuration
  VOICE: {
    APPLICATION_SID: process.env.REACT_APP_TWILIO_VOICE_APP_SID,
    API_KEY: process.env.REACT_APP_TWILIO_API_KEY,
    API_SECRET: process.env.REACT_APP_TWILIO_API_SECRET,
  },

  // Twilio Video configuration
  VIDEO: {
    ROOM_NAME: process.env.REACT_APP_TWILIO_VIDEO_ROOM_NAME || 'call-center',
  },

  // Twilio Verify configuration
  VERIFY: {
    SERVICE_SID: process.env.REACT_APP_TWILIO_VERIFY_SERVICE,
  },
};

export default API_CONFIG;
