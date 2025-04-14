/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(unified|remark-parse|remark-gfm|remark-html|unist-.*|vfile.*|mdast-.*)/)'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
