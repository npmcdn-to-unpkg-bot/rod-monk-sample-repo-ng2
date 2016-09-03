const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const validate = require('webpack-validator');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    // context: __dirname + "/app",
    entry: {
        app: [
            './app/main.js',
            'jquery',
            'jquery-ui',
            './node_modules/fullcalendar/dist/fullcalendar.js',
            './node_modules/fullcalendar-scheduler/dist/scheduler.js'
        ],
        vendor: [
            '@angular/core', '@angular/forms', '@angular/common', '@angular/http', '@angular/compiler', '@angular/router',
            'bootstrap', 'ng2-table', 'ng2-bootstrap', 'lodash', 'moment', 'platform'],
    },
    output: {
        path: __dirname + "/build",
        filename: "ttc-bundle.js"
    },

    resolve: {
        extensions: ['', '.js', '.html']
    },

    module: {
        loaders: [
            { test: /\.html$/, loader: 'raw-loader' },
            { test: /\.css$/, loader: "style-loader!css-loader" },
            { test: /\.(png|jpg|woff|woff2|eot|ttf|otf)/, loader: 'url-loader' },
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        }),
        new webpack.optimize.DedupePlugin(),
    ],
}
