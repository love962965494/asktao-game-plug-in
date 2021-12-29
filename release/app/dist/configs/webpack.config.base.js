"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var webpack_1 = __importDefault(require("webpack"));
var webpack_paths_1 = __importDefault(require("./webpack.paths"));
exports["default"] = {
    stats: 'errors-only',
    externals: {
        robotjs: 'robotjs'
    },
    module: {
        rules: [
            {
                test: /\.[jt]sx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        // Remove this line to enable type checking in webpack builds
                        transpileOnly: true
                    }
                }
            },
        ]
    },
    output: {
        path: webpack_paths_1["default"].srcPath,
        library: {
            type: 'umd'
        }
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
        modules: [webpack_paths_1["default"].srcPath, 'node_modules']
    },
    plugins: [
        new webpack_1["default"].EnvironmentPlugin({
            NODE_ENV: 'production'
        }),
    ]
};
//# sourceMappingURL=webpack.config.base.js.map