import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/easycal.cjs.js',
      format: 'cjs',
      exports: 'default',
      sourcemap: true
    },
    {
      file: 'dist/easycal.esm.js',
      format: 'esm',
      sourcemap: true
    }
  ],
  plugins: [
    postcss({
      extract: 'easycal.css',
      minimize: true,
      sourceMap: true
    }),
    typescript({
      tsconfig: './tsconfig.json',
      useTsconfigDeclarationDir: true,
      clean: true
    })
  ]
};
