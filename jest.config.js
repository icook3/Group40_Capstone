/** @type {import('jest').Config} */
const config = {
  verbose: true,
  transformIgnorePatterns: [
    'node_modules/(?!three/examples/jsm)'
  ],
  setupFilesAfterEnv: ['./jest.config.js']
};
global.matchMedia = global.matchMedia || function () {
  return {
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  };
};
/*Object.defineProperty(window,'matchMedia',{
  writable:true,
  value:jest.fn().mockImplementation(query=>({
    matches: false, 
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});*/
export default config;