// Test setup file
import { beforeAll, afterAll } from '@jest/globals';

// Global test setup
beforeAll(async () => {
  // Set up test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.MONGODB_URI = 'mongodb://localhost:27017/trufle-admin-test';
  
  console.log('Test environment initialized');
});

afterAll(async () => {
  // Clean up test environment
  console.log('Test environment cleaned up');
});

// Mock fetch for testing
global.fetch = jest.fn();

// Helper function to mock successful responses
global.mockFetchSuccess = (data, status = 200) => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    status,
    json: async () => data
  });
};

// Helper function to mock error responses
global.mockFetchError = (error, status = 400) => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => ({ error })
  });
};

// Helper function to reset fetch mocks
global.resetFetchMocks = () => {
  global.fetch.mockReset();
};
