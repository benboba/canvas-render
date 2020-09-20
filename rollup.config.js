import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

export default {
    input: './src/canvas-render.ts',
    output: [
        {
            file: pkg.module,
            format: 'es',
        },
        {
            file: pkg.main,
            format: 'umd',
            name: 'CR',
        },
    ],
    plugins: [typescript()],
}