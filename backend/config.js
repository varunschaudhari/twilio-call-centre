require('dotenv').config();

class TwilioConfig {
    constructor() {
        this.accountSid = process.env.TWILIO_ACCOUNT_SID;
        this.authToken = process.env.TWILIO_AUTH_TOKEN;
        this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;
        this.phoneNumberSid = process.env.TWILIO_PHONE_NUMBER_SID;
        this.tokenSid = process.env.TWILIO_TOKEN_SID;
        this.secret = process.env.TWILIO_SECRET;
        this.verifyService = process.env.TWILIO_VERIFY_SERVICE;

        this.validateCredentials();
    }

    validateCredentials() {
        if (!this.accountSid) {
            throw new Error('TWILIO_ACCOUNT_SID environment variable is required');
        }
        if (!this.authToken) {
            throw new Error('TWILIO_AUTH_TOKEN environment variable is required');
        }
        if (!this.phoneNumber) {
            throw new Error('TWILIO_PHONE_NUMBER environment variable is required');
        }
        if (!this.phoneNumberSid) {
            throw new Error('TWILIO_PHONE_NUMBER_SID environment variable is required');
        }
    }

    getCredentials() {
        return {
            accountSid: this.accountSid,
            authToken: this.authToken,
            phoneNumber: this.phoneNumber,
            phoneNumberSid: this.phoneNumberSid,
            tokenSid: this.tokenSid,
            secret: this.secret,
            verifyService: this.verifyService
        };
    }

    isValid() {
        return !!(this.accountSid && this.authToken && this.phoneNumber && this.phoneNumberSid);
    }

    // Check if additional services are configured
    hasVerifyService() {
        return !!(this.verifyService);
    }

    hasTokenCredentials() {
        return !!(this.tokenSid && this.secret);
    }
}

// Create and export a singleton instance
const twilioConfig = new TwilioConfig();

module.exports = twilioConfig;
