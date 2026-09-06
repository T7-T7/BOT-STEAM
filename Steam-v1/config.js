const config = {
    botName: 'FIX',
    version: 'V1.0.0',
    commandCount: 7,
    prefix: '.',

    speed: {
        enabled: true
    },

    ai: {
        enabled: true,
        apiKey: process.env.GROQ_API_KEY || '',
        model: 'openai/gpt-oss-120b'
    }
};

module.exports = config;
