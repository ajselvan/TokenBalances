/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

// export default {
//   clearMocks: true,
//   preset: 'ts-jest',
//   testEnvironment: 'node',
//   testMatch: ['**/*.spec.ts'],
//   moduleNameMapper: {
//     '@/(.*)': '<rootDir>/src/$1',
//   },
// };


// export default 
//   {
//     transform: {
//       "^.+\\.(t|j)sx?$": "ts-jest",
//       "^.+\\.jsx?$": "babel-jest"
//     },
//     moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
//     transformIgnorePatterns: ['node_modules/(?!@babel)'],
//     preset: "ts-jest"
//   };
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.spec.json',
    },
  },
};





