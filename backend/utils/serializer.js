// Utility function to safely serialize objects and avoid circular references
const safeStringify = (obj) => {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular Reference]';
            }
            seen.add(value);
        }
        return value;
    });
};

// Utility function to extract safe data from Twilio responses
const extractTwilioData = (twilioObj) => {
    if (!twilioObj) return null;
    
    // Extract only the properties we need
    const safeData = {};
    
    // Common Twilio properties
    if (twilioObj.status !== undefined) safeData.status = twilioObj.status;
    if (twilioObj.to !== undefined) safeData.to = twilioObj.to;
    if (twilioObj.sid !== undefined) safeData.sid = twilioObj.sid;
    if (twilioObj.dateCreated !== undefined) safeData.dateCreated = twilioObj.dateCreated;
    if (twilioObj.dateUpdated !== undefined) safeData.dateUpdated = twilioObj.dateUpdated;
    if (twilioObj.valid !== undefined) safeData.valid = twilioObj.valid;
    if (twilioObj.channel !== undefined) safeData.channel = twilioObj.channel;
    
    return safeData;
};

module.exports = {
    safeStringify,
    extractTwilioData
};
