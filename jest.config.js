module.exports = {
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'ts'],
  moduleDirectories: ['node_modules', 'src'],
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
  },
  testRegex: './src/.*\\.(test|spec)?\\.(ts|ts)$',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
  ]
};