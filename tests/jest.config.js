export default {
	preset: 'ts-jest',
	testEnvironment: 'node',
	verbose: true,
	collectCoverage: false,
	// collectCoverage: true,
	// collectCoverageFrom: [
	// 	'<rootDir>/app/**/*.{js,ts}',
	// ],
	// coverageDirectory: 'log',
	// coverageReporters: ['lcov', 'text', 'cobertura'],
	// reporters: [
	// 	'default',
	// 	[
	// 		'jest-junit',
	// 		{
	// 			suiteName: "Jest",
	// 			outputName: "log/junit.xml",
	// 		},
	// 	],
	// ],

	"moduleFileExtensions": [
		"js",
		"mjs",
		"cjs",
		"jsx",
		"mts",
		"ts",
		"tsx",
		"json",
		"node"
	],

	testMatch: [
		'<rootDir>/src/**/*.mts',
	],
	// testPathIgnorePatterns: [
	// 	'<rootDir>/tests/schema/handler.js',
	// 	'<rootDir>/tests/testContainer.ts',
	// 	'<rootDir>/tests/mocks',
	// ],
	maxConcurrency: 1,
	transform: {
		"^.+\\.(ts)$": 'ts-jest',
		"^.+\\.(mts)$": 'ts-jest',
		// "^.+\\.graphql$": "graphql-import-node/jest",
	},
	testTimeout: 10000,
};
