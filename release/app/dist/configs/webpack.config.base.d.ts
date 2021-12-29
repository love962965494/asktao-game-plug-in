declare namespace _default {
    const stats: string;
    namespace externals {
        const robotjs: string;
    }
    namespace module {
        const rules: {
            test: RegExp;
            exclude: RegExp;
            use: {
                loader: string;
                options: {
                    transpileOnly: boolean;
                };
            };
        }[];
    }
    namespace output {
        const path: string;
        namespace library {
            const type: string;
        }
    }
    namespace resolve {
        const extensions: string[];
        const modules: string[];
    }
    const plugins: webpack.EnvironmentPlugin[];
}
export default _default;
import webpack from "webpack";
//# sourceMappingURL=webpack.config.base.d.ts.map