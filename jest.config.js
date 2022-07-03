module.exports = {
  // tells Jest to use jsdom as our DOM implementation (requires jest-environment-jsdom)
  testEnvironment: 'jsdom',
  // treat CSS imports as just generic objects to avoid error
  moduleNameMapper: {
    '.(css|less|scss)$': 'identity-obj-proxy',
  },
};
