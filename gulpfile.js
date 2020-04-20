const path = require('path')
const gulp = require('gulp')
const { rollup } = require('rollup')
const typescript = require('@rollup/plugin-typescript')

const pkg1 = require('./package.json')
const pkg2 = require('./packages/rx/package.json')

const base = path.resolve(__dirname, 'packages')

//Prevent bundling (peer)dependencies in package.json
const depens = Object.keys({
  ...pkg1.dependencies,
  ...pkg1.peerDependencies,
  ...pkg2.dependencies,
  ...pkg2.peerDependencies,
}).map((k) => new RegExp(k))

function bundle(config) {
  return rollup(config).then((bundle) => {
    return Promise.all(config.output.map((output) => bundle.write(output)))
  })
}

function core() {
  return bundle({
    input: path.join(base, 'core/index.ts'),
    output: [
      {
        dir: 'dist/core',
        entryFileNames: '[name].js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        dir: 'dist/core',
        entryFileNames: '[name].module.js',
        format: 'es',
        sourcemap: true,
      },
    ],
    context: 'this',
    external: (id) => depens.some((key) => key.test(id)),
    plugins: [
      typescript({
        tsconfig: path.join(base, 'core/tsconfig.json'),
        rootDir: path.join(base, 'core'),
        exclude: ['**/node_modules/**', '**/*.test.ts'],
      }),
    ],
  })
}

function rx() {
  return bundle({
    input: path.join(base, 'rx/index.ts'),
    output: [
      {
        dir: 'dist/rx',
        entryFileNames: '[name].js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        dir: 'dist/rx',
        entryFileNames: '[name].module.js',
        format: 'es',
        sourcemap: true,
      },
    ],
    context: 'this',
    external: (id) => depens.some((key) => key.test(id)),
    plugins: [
      typescript({
        tsconfig: path.join(base, 'rx/tsconfig.json'),
        rootDir: path.join(base, 'rx'),
        exclude: ['**/node_modules/**', '**/*.test.ts'],
      }),
    ],
  })
}

exports.build = gulp.series(core, rx)
