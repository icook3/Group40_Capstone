const Redis = require('ioredis');

const client = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 4001,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
        if (times > 3) return null
        return times * 200
    }
});

client.on('connect', () => {
    console.log('Connected to Redis');
});

client.on('error', (err) => {
    console.error('Redis error:', err);
});

module.exports = client;