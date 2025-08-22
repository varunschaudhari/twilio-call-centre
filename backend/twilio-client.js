const twilio = require('twilio');

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
        return await await this.client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE).verifications.create({
            to: to,
            channel: channel
        });
    }

    async verifyOTP(to, code) {
        try {
            const verificationCheck = await this.client.verify.v2
                .services(process.env.TWILIO_VERIFY_SERVICE)
                .verificationChecks.create({ to, code });

            return verificationCheck;
        } catch (error) {
            console.error("Error verifying OTP:", error);
            throw error;
        }
    }
}

module.exports = Twilio;
