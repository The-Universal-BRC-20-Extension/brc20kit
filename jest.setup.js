/**
 * Jest Setup File
 * 
 * Global test setup and mocks
 */

// Mock fetch globally (will be overridden in individual tests)
if (typeof global.fetch === "undefined") {
  global.fetch = jest.fn()
}

// Mock performance API if not available
if (typeof global.performance === "undefined") {
  global.performance = {
    now: jest.fn(() => Date.now()),
  }
}

// Suppress console output during tests to keep test output clean
// Store original console methods for debugging if needed
const originalConsole = { ...console }

// Suppress console.log, console.warn, console.error during tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  // Keep trace for actual errors
  trace: console.trace,
  // Keep assert for test assertions
  assert: console.assert,
}
