const twilioConfig = require('./config');
const twilio = require('twilio');

// Example of how to use the configuration
try {
    // Get credentials
    const credentials = twilioConfig.getCredentials();
    console.log('Twilio configuration loaded successfully');

    // Initialize Twilio client
    const client = twilio(credentials.accountSid, credentials.authToken);

    // Example: Send an SMS
    async function sendSMS(to, message) {
        try {
            const result = await client.messages.create({
                body: message,
                from: credentials.phoneNumber,
                to: to
            });
            console.log('SMS sent successfully:', result.sid);
            return result;
        } catch (error) {
            console.error('Error sending SMS:', error);
            throw error;
        }
    }

    // Example: Make a call
    async function makeCall(to, twimlUrl) {
        try {
            const result = await client.calls.create({
                url: twimlUrl,
                from: credentials.phoneNumber,
                to: to
            });
            console.log('Call initiated successfully:', result.sid);
            return result;
        } catch (error) {
            console.error('Error making call:', error);
            throw error;
        }
    }

    // Export functions for use in other modules
    module.exports = {
        sendSMS,
        makeCall,
        client
    };

} catch (error) {
    console.error('Configuration error:', error.message);
    process.exit(1);
}
