const Redis = require('ioredis')

test('redis connects and responds', async () => {
    const client = new Redis({
        host: '127.0.0.1',
        port: 4001
    })

    const result = await client.ping()
    console.log('ping result:', result)
    expect(result).toBe('PONG')
    await client.quit()
}, 10000)