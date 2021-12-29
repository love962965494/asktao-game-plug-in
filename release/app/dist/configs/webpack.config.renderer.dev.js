"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var check_node_env_1 = __importDefault(require("../scripts/check-node-env"));
var webpack_merge_1 = require("webpack-merge");
var webpack_config_base_1 = __importDefault(require("./webpack.config.base"));
var webpack_paths_1 = __importDefault(require("./webpack.paths"));
var webpack_1 = __importDefault(require("webpack"));
var html_webpack_plugin_1 = __importDefault(require("html-webpack-plugin"));
var child_process_1 = require("child_process");
var react_refresh_webpack_plugin_1 = __importDefault(require("@pmmmwh/react-refresh-webpack-plugin"));
var path = require('path');
// When an ESLint server is running, we can't set the NODE_ENV so we'll check if it's
// at the dev webpack config is not accidentally run in a production environment
if (process.env.NODE_ENV === 'production') {
    check_node_env_1["default"]('development');
}
var port = process.env.PORT || 1212;
exports["default"] = webpack_merge_1.merge(webpack_config_base_1["default"], {
    devtool: 'inline-source-map',
    mode: 'development',
    target: ['web', 'electron-renderer'],
    entry: [
        "webpack-dev-server/client?http://localhost:" + port + "/dist",
        'webpack/hot/only-dev-server',
        path.join(webpack_paths_1["default"].srcRendererPath, 'index.tsx'),
    ],
    output: {
        path: webpack_paths_1["default"].distRendererPath,
        filename: 'renderer.dev.js'
    },
    module: {
        rules: [
            {
                test: /\.s?css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            sourceMap: true,
                            importLoaders: 1
                        }
                    },
                    'sass-loader',
                ],
                include: /\.module\.s?(c|a)ss$/
            },
            {
                test: /\.s?css$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
                exclude: /\.module\.s?(c|a)ss$/
            },
            // Fonts
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource'
            },
            // Images
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource'
            },
        ]
    },
    plugins: ([
        new webpack_1["default"].EnvironmentPlugin({
            NODE_ENV: 'development'
        }),
        new react_refresh_webpack_plugin_1["default"](),
        new html_webpack_plugin_1["default"]({
            filename: path.join('index.html'),
            template: path.join(webpack_paths_1["default"].srcRendererPath, 'index.ejs'),
            minify: {
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                removeComments: true
            }
        }),
    ]),
    node: {
        __dirname: false,
        __filename: false
    },
    devServer: {
        port: port,
        compress: true,
        hot: true,
        headers: { 'Access-Control-Allow-Origin': '*' },
        static: {
            publicPath: '/'
        },
        historyApiFallback: {
            verbose: true,
            disableDotRule: false
        },
        onBeforeSetupMiddleware: function () {
            console.log('Starting Main Process...');
            child_process_1.spawn('npm', ['run', 'start:main'], {
                shell: true,
                env: process.env,
                stdio: 'inherit'
            })
                .on('close', function (code) { return process.exit(code); })
                .on('error', function (spawnError) { return console.error(spawnError); });
        }
    }
});
//# sourceMappingURL=webpack.config.renderer.dev.js.map