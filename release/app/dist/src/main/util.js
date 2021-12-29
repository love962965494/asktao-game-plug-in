"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.resolveHtmlPath = void 0;
/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
var url_1 = require("url");
var path_1 = __importDefault(require("path"));
if (process.env.NODE_ENV === 'development') {
    var port_1 = process.env.PORT || 1212;
    exports.resolveHtmlPath = function (htmlFileName) {
        var url = new url_1.URL("http://localhost:" + port_1);
        url.pathname = htmlFileName;
        return url.href;
    };
}
else {
    exports.resolveHtmlPath = function (htmlFileName) {
        return "file://" + path_1["default"].resolve(__dirname, '../renderer/', htmlFileName);
    };
}
//# sourceMappingURL=util.js.map