import webpack from 'webpack';
declare const _default: {
    stats: string;
    externals: {
        robotjs: string;
    };
    module: {
        rules: {
            test: RegExp;
            exclude: RegExp;
            use: {
                loader: string;
                options: {
                    transpileOnly: boolean;
                };
            };
        }[];
    };
    output: {
        path: string;
        library: {
            type: string;
        };
    };
    resolve: {
        extensions: string[];
        modules: string[];
    };
    plugins: webpack.EnvironmentPlugin[];
};
export default _default;
//# sourceMappingURL=webpack.config.renderer.dev.d.ts.map