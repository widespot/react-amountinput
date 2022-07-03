import external from 'rollup-plugin-peer-deps-external';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import { terser } from 'rollup-plugin-terser';

// import typescript from '@rollup/plugin-typescript';
// import dts from 'rollup-plugin-dts';

// https://dev.to/alexeagleson/how-to-create-and-publish-a-react-component-library-2oe#adding-css
// https://dev.to/siddharthvenkatesh/component-library-setup-with-react-typescript-and-rollup-onj

const packageJson = require('./package.json');

export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: packageJson.main.replace('.min.js', '.js'),
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
        plugins: [terser()],
      },
      {
        file: packageJson.module.replace('.min.js', '.js'),
        format: 'esm',
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
        plugins: [terser()],
      },
    ],
    plugins: [
      // prevent bundling peerDependencies
      external(),
      // Resolve third party dependencies in node_modules
      resolve({ extensions: ['.jsx', '.js'] }),
      // parse jsx
      babel({
        exclude: 'node_modules/**',
        presets: ['@babel/env', '@babel/preset-react'],
      }),
      // Handle css
      postcss({
        plugins: [autoprefixer()],
        // inject: false,
        // extract: false,
        extract: 'styles.css',
      }),
      // convert commonjs modules into ES6
      commonjs(),
      //
      // typescript({ tsconfig: './tsconfig.json' }),
    ],
  },
  /*
  {
    input: 'dist/esm/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts()],
  },
  */
];
