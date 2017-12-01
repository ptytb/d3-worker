import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';

export default {
    input: 'test/test.js',
    output: [
        {
            file: "build/test.js",
            format: 'umd',
            name: 'TestBundle'
        },
    ],
    sourcemap: 'inline',
    treeshake: false,
    plugins: [
        resolve({
            jsnext: true,
            main: true,
            preferBuiltins: true,
            browser: true,
            modules: true,
            customResolveOptions: {
                moduleDirectory: 'node_modules'
            },
        }),

        babel({
            exclude: 'node_modules/**',
            babelrc: true,
        }),
    ],
};
