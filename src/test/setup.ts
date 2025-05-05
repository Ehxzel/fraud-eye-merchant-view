
// Test setup file for Vitest
// This file runs before each test

// Import global mocks if needed
import { vi } from 'vitest';

// Set up global test environment
// For example, mock global fetch or other browser APIs if needed
global.fetch = vi.fn();

// You can extend expect with custom matchers
// Example: 
// expect.extend({
//   toBeWithinRange(received, floor, ceiling) {
//     const pass = received >= floor && received <= ceiling;
//     return {
//       pass,
//       message: () => `expected ${received} ${pass ? 'not ' : ''}to be within range ${floor} - ${ceiling}`,
//     };
//   },
// });

// Set environment variables for testing
process.env.VITE_IPQS_API_KEY = 'test-api-key';
