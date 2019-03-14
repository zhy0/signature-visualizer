const path = require('path');

module.exports = {
    entry: './src/sketch.js',
    mode: process.env.NODE_ENV || 'production',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist')
    }
};
