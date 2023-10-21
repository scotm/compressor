const path = require('node:path');

module.exports = {
    env: {
        browser: true,
        node: true,
        es6: true,
    },
    globals: {
        JSX: true,
    },
    extends: ['plugin:prettier/recommended', 'plugin:jsx-a11y/recommended', 'plugin:import/recommended'],
    plugins: ['react', 'react-hooks'],
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
                paths: [path.resolve(__dirname, './src'), path.resolve(__dirname, 'src/constants')],
            },
        },
    },
};
