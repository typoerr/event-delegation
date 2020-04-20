module.exports = {
  preset: 'ts-jest',
  verbose: true,
  moduleNameMapper: {
    '@typoerr/event-delegation': '<rootDir>/packages/core/index.ts',
  },
  globals: {
    'ts-jest': {
      tsConfig: {
        baseUrl: '.',
        paths: {
          '@typoerr/event-delegation': ['./packages/core/index.ts'],
        },
      },
    },
  },
}
