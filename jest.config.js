export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  collectCoverageFrom: [
    "src/controllers/*.ts",
    "src/services/*.ts",
    "!src/**/*.d.ts",
  ],
  coverageDirectory: "coverage",
  testTimeout: 10000,
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: false,
      },
    ],
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  // Ignore node_modules and generated files
  transformIgnorePatterns: ["node_modules/(?!(@prisma)/)"],
};
