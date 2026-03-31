import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

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
        resolve({
            extensions: ['.mjs', '.js', '.json', '.ts']
        }),        commonjs(),
        typescript({
            tsconfig: './tsconfig.json',
            useTsconfigDeclarationDir: true,
            clean: true
        }),
        postcss({
            extract: 'easycal.css',
            minimize: true,
            sourceMap: true
        }),
    ]
};