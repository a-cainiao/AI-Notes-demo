// 加载环境变量
const dotenv = require('dotenv');
dotenv.config({ path: '.env.test' });

const config = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx'],
  transform: {
    '^.+\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        module: 'ESNext',
      },
    }],
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(test|spec).ts?(x)',
    '<rootDir>/src/**/*.(test|spec).ts?(x)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  // 允许Jest访问环境变量
  setupFiles: ['dotenv/config'],
};

module.exports = config;
