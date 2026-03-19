const Redis = require('ioredis');

const client = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 4001,
});

client.on('connect', () => {
    console.log('Connected to Redis')
});

client.on('error', (err) => {
    console.error('Redis error:', err)
});

module.exports = client;