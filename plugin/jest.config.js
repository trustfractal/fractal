module.exports = {
  roots: ["<rootDir>/src"],
  collectCoverageFrom: ["src/**/*.{js,jsx,ts,tsx}", "!src/**/*.d.ts"],
  setupFiles: ["react-app-polyfill/jsdom"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}",
  ],
  testEnvironment: "jsdom",
  testRunner: "<rootDir>/../node_modules/jest-circus/runner.js",
  transform: {
    "^.+\\.(js|jsx|mjs|cjs|ts|tsx)$": "<rootDir>/config/jest/babelTransform.js",
    "^.+\\.css$": "<rootDir>/config/jest/cssTransform.js",
    "^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)":
      "<rootDir>/config/jest/fileTransform.js",
  },
  transformIgnorePatterns: [
    "[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
  modulePaths: [],
  moduleNameMapper: {
    "^react-native$": "react-native-web",
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",
    "^\\@assets(.*)$": "<rootDir>/src/assets/$1",
    "^\\@models(.*)$": "<rootDir>/src/models/$1",
    "^\\@background(.*)$": "<rootDir>/src/scripts/background/$1",
    "^\\@contentScript(.*)$": "<rootDir>/src/scripts/contentScript/$1",
    "^\\@sdk(.*)$": "<rootDir>/src/scripts/sdk/$1",
    "^\\@popup(.*)$": "<rootDir>/src/popup/$1",
    "^\\@redux(.*)$": "<rootDir>/src/redux/$1",
    "^\\@services(.*)$": "<rootDir>/src/services/$1",
    "^\\@constants(.*)$": "<rootDir>/src/constants/$1",
    "^\\@contracts(.*)$": "<rootDir>/src/contracts/$1",
    "^\\@utils(.*)$": "<rootDir>/src/utils/$1",
  },
  moduleFileExtensions: [
    "web.js",
    "js",
    "web.ts",
    "ts",
    "web.tsx",
    "tsx",
    "json",
    "web.jsx",
    "jsx",
    "node",
  ],
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
  resetMocks: true,
};
