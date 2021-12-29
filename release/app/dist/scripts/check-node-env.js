"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var chalk_1 = __importDefault(require("chalk"));
function checkNodeEnv(expectedEnv) {
    if (!expectedEnv) {
        throw new Error('"expectedEnv" not set');
    }
    if (process.env.NODE_ENV !== expectedEnv) {
        console.log(chalk_1["default"].whiteBright.bgRed.bold("\"process.env.NODE_ENV\" must be \"" + expectedEnv + "\" to use this webpack config"));
        process.exit(2);
    }
}
exports["default"] = checkNodeEnv;
//# sourceMappingURL=check-node-env.js.map