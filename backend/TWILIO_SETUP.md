# Twilio Setup Guide

## 🔧 **Step 1: Create Twilio Account**

1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for a free account
3. Verify your email and phone number

## 🔧 **Step 2: Get Your Account Credentials**

1. **Account SID**: Found in your Twilio Console dashboard
2. **Auth Token**: Found in your Twilio Console dashboard (click "Show" to reveal)

## 🔧 **Step 3: Get a Phone Number**

1. Go to "Phone Numbers" → "Manage" → "Active numbers"
2. Click "Get a trial number" (free for trial accounts)
3. Note down the phone number and its SID

## 🔧 **Step 4: Create Verify Service (IMPORTANT!)**

1. Go to "Products" → "Verify"
2. Click "Create a Verify Service"
3. Fill in the details:
   - **Friendly name**: "Call Center Verification"
   - **Default channel**: SMS
   - **Code length**: 6
   - **Custom code**: No
4. Click "Create"
5. **Copy the Verify Service SID** (starts with `VA`)

## 🔧 **Step 5: Create API Keys (for client-side tokens)**

1. Go to "Settings" → "API Keys"
2. Click "Create API Key"
3. Fill in:
   - **Friendly name**: "Call Center API Key"
   - **Key type**: Standard
4. Click "Create"
5. **Copy the SID and Secret** (you won't see the secret again!)

## 🔧 **Step 6: Update Your .env File**

Create a `.env` file in the backend directory with:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_PHONE_NUMBER_SID=PNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_TOKEN_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_SECRET=your_api_key_secret_here
TWILIO_VERIFY_SERVICE=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
```

## 🔧 **Step 7: Test Your Configuration**

1. Start the backend server: `npm start`
2. Check the health endpoint: `http://localhost:3000/health`
3. You should see all services configured as "configured"

## 🚨 **Common Issues**

### **Error: "The requested resource /v2/Services/... was not found"**
- **Solution**: Make sure you created a Verify service and copied the correct SID
- The SID should start with `VA`

### **Error: "Invalid phone number"**
- **Solution**: Use E.164 format (+1234567890)
- Make sure the phone number is verified in your Twilio account

### **Error: "Authentication failed"**
- **Solution**: Check your Account SID and Auth Token
- Make sure they're copied correctly from the Twilio Console

## 📞 **Testing with Your Phone**

1. Use your own phone number for testing
2. Make sure it's in E.164 format (+1234567890)
3. You'll receive an SMS with a 6-digit code
4. Enter the code in the frontend

## 🔒 **Security Notes**

- Never commit your `.env` file to version control
- Use environment variables in production
- Rotate your API keys regularly
- Use HTTPS in production

## 📚 **Additional Resources**

- [Twilio Verify Documentation](https://www.twilio.com/docs/verify)
- [Twilio API Reference](https://www.twilio.com/docs/api)
- [Twilio Console](https://console.twilio.com/)
