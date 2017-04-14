require('dotenv').config();
process.env.APP_URL = 'http://lp-gallery.local/';
const
    path = require('path'),

    webpack = require('webpack'),
    BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin,
    ExtractTextPlugin = require('extract-text-webpack-plugin'),

    resolve = (rel, sep = '/') => path.resolve(__dirname, ...rel.split(sep));

if (process.env.NODE_ENV !== 'production' && !process.env.APP_URL) {
    throw new Error('APP_URL environment variable for WDS proxy target is not specified');
}

const webpackConfig = {

    context: path.resolve(__dirname, "src"),

    entry: {
        app: [
            'babel-polyfill',
            './js/app.js'
        ]
    },

    output: {
        path: path.resolve(__dirname, 'dist/js'),
        publicPath: "dist/js/",
        filename: 'app.js'
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
        ]
    },

    devtool: 'inline-source-map',

    watchOptions: {
        aggregateTimeout: 500,
        poll: 1000
    },

    devServer: {
        proxy: [
            {
                context: '/**',
                target: process.env.APP_URL,
                changeOrigin: true
            }
        ]
    },

    plugins: [
        new webpack.NoEmitOnErrorsPlugin()
    ]

};


if (process.env.NODE_ENV === 'production') {
    webpackConfig.devtool = 'source-map';

    webpackConfig.module.rules = (webpackConfig.module.rules || []).concat([
        {
            test: /\.scss$/,
            loaders: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: [
                    'css-raw-loader?sourceMap',
                    'sass-loader?sourceMap'
                ]
            })
        }
    ]);

    webpackConfig.plugins = (webpackConfig.plugins || []).concat([
        new ExtractTextPlugin({
            filename: '../css/[name].css'
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: `"production"` // short-circuits all Vue.js warning code
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ]);

    if (process.env.WEBPACK_ANALYZE_BUNDLE === 'true') {
        webpackConfig.plugins.push(new BundleAnalyzerPlugin);
    }
} else {
    webpackConfig.module.rules = (webpackConfig.module.rules || []).concat([
        {
            test: /\.scss$/,
            loaders: [
                'style-loader',
                'css-loader?sourceMap',
                'sass-loader?sourceMap'
            ],
        }
    ]);
}

module.exports = webpackConfig;
