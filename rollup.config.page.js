import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';

export default {
    input: 'src/wrapper.js',
    output: [
        {
            file: "dist/d3-worker-wrapper.js",
            format: 'umd',
            name: 'PageBundle'
        },
    ],
    sourceMap: false,
    treeshake: true,
    external: [
        'worker', 'wrapper'
    ],
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
