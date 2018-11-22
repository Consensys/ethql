module.exports = {
  roots: ['<rootDir>/packages'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*(\\.|/)(test|spec))\\.(js|ts)$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  moduleNameMapper: {
    '^@ethql/base/dist/(.*)$': '<rootDir>/packages/base/src/$1',
    '^@ethql/(.*)$': '<rootDir>/packages/$1/src/',
  },
  verbose: true,
  setupTestFrameworkScriptFile: './jest.setup.js',
  testEnvironment: 'node'
};