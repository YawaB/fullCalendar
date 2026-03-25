const postcss = require('rollup-plugin-postcss');
const terser = require('@rollup/plugin-terser');
module.exports = {
  input: 'src/easycal.js',
  output: [
    // CommonJS (Node / legacy)
    {
      file: 'dist/easycal.cjs',
      format: 'cjs',
      exports: 'default',
      sourcemap: true,
    },

    // ES Module (modern bundlers)
    {
      file: 'dist/easycal.esm.js',
      format: 'esm',
      sourcemap: true,
    },

    // UMD (browser global)
    {
      file: 'dist/easycal.umd.js',
      format: 'umd',
      name: 'EasyCal',
      exports: 'default',
      sourcemap: true,
    },

    // UMD minifié (CDN)
    {
      file: 'dist/easycal.umd.min.js',
      format: 'umd',
      name: 'EasyCal',
      exports: 'default',
      plugins: [terser()],
    },
  ],

  plugins: [
    postcss({
      extract: 'easycal.css',
      minimize: true,
      sourceMap: true,
    }),
  ],
};