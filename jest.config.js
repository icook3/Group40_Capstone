/** @type {import('jest').Config} */
const config = {
  verbose: true,
  "testEnvironment": "jsdom",
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: ['/node_modules/'],
};

export default config;

