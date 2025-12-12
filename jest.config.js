/**
 * Jest Configuration for BRC-20 Kit
 * 
 * Test configuration for PSBT size calculator and Unisat API integration
 */

const nextJest = require("next/jest")

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "node", // Use node environment for unit tests (no DOM needed)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/.next-dev/"],
  collectCoverageFrom: [
    "lib/**/*.{js,jsx,ts,tsx}",
    "app/**/*.{js,jsx,ts,tsx}",
    "!lib/**/*.d.ts",
    "!app/**/*.d.ts",
    "!**/*.stories.{js,jsx,ts,tsx}",
  ],
  coveragePathIgnorePatterns: ["/node_modules/", "/.next/", "/.next-dev/"],
  transformIgnorePatterns: [
    "/node_modules/(?!(.*\\.mjs$|bitcoinjs-lib|@omnisat))",
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
