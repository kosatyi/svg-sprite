import typescript from "@rollup/plugin-typescript";

export default {
    input: 'index.ts',
    output: [
        {
            file: 'dist/esm/index.mjs',
            format: 'esm',
        },
        {
            file: 'dist/cjs/index.cjs',
            format: 'cjs',
        },
    ],
    external: ['fs', 'path', 'glob','cheerio'],
    plugins: [typescript()],
}