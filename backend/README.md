# Twilio Call Center Backend

A Node.js backend application for managing Twilio call center functionality.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `env.example` to `.env`
   - Fill in your Twilio credentials:
           ```
      TWILIO_ACCOUNT_SID=your_account_sid_here
      TWILIO_AUTH_TOKEN=your_auth_token_here
      TWILIO_PHONE_NUMBER=+1234567890
      TWILIO_PHONE_NUMBER_SID=your_phone_number_sid_here
      TWILIO_TOKEN_SID=your_token_sid_here
      TWILIO_SECRET=your_secret_here
      TWILIO_VERIFY_SERVICE=your_verify_service_sid_here
      ```

3. **Get your Twilio credentials:**
   - Log in to your [Twilio Console](https://console.twilio.com/)
   - Find your Account SID and Auth Token on the dashboard
   - Get your Twilio phone number from the Phone Numbers section

## Usage

### Basic Configuration
```javascript
const twilioConfig = require('./config');

// Get credentials
const credentials = twilioConfig.getCredentials();

// Check if configuration is valid
if (twilioConfig.isValid()) {
    console.log('Configuration is valid');
}
```

### Send SMS
```javascript
const { sendSMS } = require('./example');

// Send an SMS
await sendSMS('+1234567890', 'Hello from your call center!');
```

### Make a Call
```javascript
const { makeCall } = require('./example');

// Make a call with TwiML URL
await makeCall('+1234567890', 'https://your-domain.com/twiml');
```

## Project Structure

- `server.js` - Express server with Socket.IO integration
- `config.js` - Twilio configuration management
- `example.js` - Example usage of Twilio functions
- `test-client.html` - Socket.IO test client
- `package.json` - Node.js dependencies and scripts
- `env.example` - Environment variables template
- `.gitignore` - Git ignore rules for Node.js

## Security Notes

- Never commit your `.env` file to version control
- Keep your Twilio Auth Token secure
- Use environment variables for all sensitive data
- Consider using Twilio's API keys for production applications

## Running the Application

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## Server Endpoints

- `GET /` - Server status and information
- `GET /health` - Health check with Twilio configuration status

## Socket.IO Events

- `connection` - Client connects to server
- `disconnect` - Client disconnects from server
- `join-room` - Join a specific room
- `leave-room` - Leave a specific room

## Testing

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Test HTTP endpoints:**
   ```bash
   curl http://localhost:3000/health
   ```

3. **Test Socket.IO:**
   - Open `test-client.html` in your browser
   - The page will automatically connect to the server
   - Use the buttons to test room functionality
