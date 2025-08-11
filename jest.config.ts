import type { Config } from 'jest';

const config: Config = {
    testEnvironment: 'node',
    preset: 'ts-jest',
    testMatch: ['**/tests/**/*.test.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'],
    clearMocks: true,
    restoreMocks: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'schemas/**/*.ts',
        '!**/node_modules/**',
        '!**/dist/**'
    ],
    coverageReporters: ['text', 'lcov'],
    coverageThreshold: {
        global: { branches: 90, functions: 95, lines: 95, statements: 95 },
    },
};

export default config;
