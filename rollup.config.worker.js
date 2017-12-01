// import path from 'path';
// import fs from 'fs';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
//import commonjs from 'rollup-plugin-commonjs';
// import inject from 'rollup-plugin-inject';

// let pkg = JSON.parse(fs.readFileSync('./package.json'));
// external = Object.keys(pkg.dependencies || {});
//    babelRc = pkg.babel || JSON.parse(fs.readFileSync('./.babelrc'));

export default {
    input: 'src/worker.js',
    output: [
        {
            file: "dist/d3-worker.js",
            format: 'cjs',
            name: 'WorkerBundle'
        },
    ],
    sourcemap: false,
    intro: 'var document = undefined;',
    treeshake: true,
    external: [
        'wrapper', 'dom'
    ],
    plugins: [
        // inject({
        //   include: 'src/worker.js',
        //   exclude: 'node_modules/**',
        //   modules: {
        //       'document': path.resolve('src/globals.js'),
        //   },
        // }),

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

    //    commonjs(),
    ],
};
