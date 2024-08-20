import terser from '@rollup/plugin-terser';

/** @type {import('rollup').RollupOptions} */
export default {
  input: 'ui/js/index.js',
  output: {
    file: 'ui/ui.min.js',
    format: 'cjs',
    compact: true,
    strict: true,
  },
  treeshake: true,
  plugins: [
    terser({
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    }),
  ],
};
