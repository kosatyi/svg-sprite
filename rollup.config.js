import typescript from "@rollup/plugin-typescript";
import {dts} from "rollup-plugin-dts";

export default [{
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/index.esm.js',
            format: 'esm',
        },
        {
            file: 'dist/index.cjs.js',
            format: 'cjs',
        },
    ],
    external: ['node:fs/promises', 'node:path', 'glob', 'cheerio'],
    plugins: [typescript()],
}, {
    input: 'src/index.ts',
    output: {
        file: 'dist/index.d.ts',
        format: 'es',
    },
    external: ['fs', 'path', 'glob', 'cheerio'],
    plugins: [dts()]
}]