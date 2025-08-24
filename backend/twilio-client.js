const twilio = require('twilio');
const { extractTwilioData } = require('./utils/serializer');

class Twilio {
    constructor() {
        this.client = twilio(process.env.TWILIO_TOKEN_SID, process.env.TWILIO_SECRET,
            {
                accountSid: process.env.TWILIO_ACCOUNT_SID
            });
    }

    getTwilioClient() {
        return this.client;
    }

    async sendVerifySMS(to, channel) {
        try {
            // Check if Verify service is configured
            if (!process.env.TWILIO_VERIFY_SERVICE) {
                throw new Error('TWILIO_VERIFY_SERVICE environment variable is not configured. Please create a Verify service in Twilio Console and add the SID to your .env file.');
            }

            const verification = await this.client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE).verifications.create({
                to: to,
                channel: channel
            });

            // Extract only the necessary data to avoid circular references
            return extractTwilioData(verification);
        } catch (error) {
            console.error("Error sending SMS verification:", error);

            // Provide more helpful error messages
            if (error.code === 20404) {
                throw new Error(`Verify service not found. Please check your TWILIO_VERIFY_SERVICE configuration. Current value: ${process.env.TWILIO_VERIFY_SERVICE || 'NOT SET'}`);
            } else if (error.code === 60200) {
                throw new Error('Phone number is not verified. Please verify your phone number in Twilio Console first.');
            } else if (error.code === 60202) {
                throw new Error('Invalid phone number format. Please use E.164 format (+1234567890).');
            }

            throw error;
        }
    }

    async verifyOTP(to, code) {
        try {
            // Check if Verify service is configured
            if (!process.env.TWILIO_VERIFY_SERVICE) {
                throw new Error('TWILIO_VERIFY_SERVICE environment variable is not configured. Please create a Verify service in Twilio Console and add the SID to your .env file.');
            }

            const verificationCheck = await this.client.verify.v2
                .services(process.env.TWILIO_VERIFY_SERVICE)
                .verificationChecks.create({ to, code });

            // Extract only the necessary data to avoid circular references
            return extractTwilioData(verificationCheck);
        } catch (error) {
            console.error("Error verifying OTP:", error);

            // Provide more helpful error messages
            if (error.code === 20404) {
                throw new Error(`Verify service not found. Please check your TWILIO_VERIFY_SERVICE configuration. Current value: ${process.env.TWILIO_VERIFY_SERVICE || 'NOT SET'}`);
            } else if (error.code === 60202) {
                throw new Error('Invalid verification code. Please check the code and try again.');
            } else if (error.code === 60200) {
                throw new Error('Verification code expired. Please request a new code.');
            }

            throw error;
        }
    }
}

module.exports = Twilio;
