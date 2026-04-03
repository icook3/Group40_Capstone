module.exports = {
    testEnvironment: 'node',
    transformIgnorePatterns: [
        'node_modules/(?!(uuid)/)'
    ],
    testTimeout: 10000
}