"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var jsx_runtime_1 = require("react/jsx-runtime");
require("./App.css");
var electron_1 = require("electron");
function useIpcRender() {
    electron_1.ipcRenderer.on('mouseMove:reply', function (event, arg) {
        console.log('event: ', event);
        console.log('arg: ', arg);
    });
}
var Hello = function () {
    var handleBtnClick = function () {
    };
    return (jsx_runtime_1.jsx("div", { children: jsx_runtime_1.jsx("button", __assign({ type: "button", onClick: handleBtnClick }, { children: "\u70B9\u51FB\u79FB\u52A8" }), void 0) }, void 0));
};
function App() {
    return jsx_runtime_1.jsx(Hello, {}, void 0);
}
exports["default"] = App;
//# sourceMappingURL=App.js.map