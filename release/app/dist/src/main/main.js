"use strict";
/* eslint global-require: off, no-console: off, promise/always-return: off */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
var path_1 = __importDefault(require("path"));
var electron_1 = require("electron");
var electron_updater_1 = require("electron-updater");
var electron_log_1 = __importDefault(require("electron-log"));
var menu_1 = __importDefault(require("./menu"));
var util_1 = require("./util");
var AppUpdater = /** @class */ (function () {
    function AppUpdater() {
        electron_log_1["default"].transports.file.level = 'info';
        electron_updater_1.autoUpdater.logger = electron_log_1["default"];
        electron_updater_1.autoUpdater.checkForUpdatesAndNotify();
    }
    return AppUpdater;
}());
exports["default"] = AppUpdater;
var mainWindow = null;
electron_1.ipcMain.on('ipc-example', function (event, arg) { return __awaiter(void 0, void 0, void 0, function () {
    var msgTemplate;
    return __generator(this, function (_a) {
        msgTemplate = function (pingPong) { return "IPC test: " + pingPong; };
        console.log(msgTemplate(arg));
        event.reply('ipc-example', msgTemplate('pong'));
        return [2 /*return*/];
    });
}); });
if (process.env.NODE_ENV === 'production') {
    var sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
}
var isDevelopment = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
if (isDevelopment) {
    require('electron-debug')();
}
var installExtensions = function () { return __awaiter(void 0, void 0, void 0, function () {
    var installer, forceDownload, extensions;
    return __generator(this, function (_a) {
        installer = require('electron-devtools-installer');
        forceDownload = !!process.env.UPGRADE_EXTENSIONS;
        extensions = ['REACT_DEVELOPER_TOOLS'];
        return [2 /*return*/, installer["default"](extensions.map(function (name) { return installer[name]; }), forceDownload)["catch"](console.log)];
    });
}); };
var createWindow = function () { return __awaiter(void 0, void 0, void 0, function () {
    var RESOURCES_PATH, getAssetPath, menuBuilder;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!isDevelopment) return [3 /*break*/, 2];
                return [4 /*yield*/, installExtensions()];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2:
                RESOURCES_PATH = electron_1.app.isPackaged
                    ? path_1["default"].join(process.resourcesPath, 'assets')
                    : path_1["default"].join(__dirname, '../../assets');
                getAssetPath = function () {
                    var paths = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        paths[_i] = arguments[_i];
                    }
                    return path_1["default"].join.apply(path_1["default"], __spreadArrays([RESOURCES_PATH], paths));
                };
                mainWindow = new electron_1.BrowserWindow({
                    show: false,
                    width: 1024,
                    height: 728,
                    icon: getAssetPath('icon.png'),
                    webPreferences: {
                        nodeIntegration: true,
                        preload: path_1["default"].join(__dirname, 'preload.js')
                    }
                });
                mainWindow.loadURL(util_1.resolveHtmlPath('index.html'));
                mainWindow.on('ready-to-show', function () {
                    if (!mainWindow) {
                        throw new Error('"mainWindow" is not defined');
                    }
                    if (process.env.START_MINIMIZED) {
                        mainWindow.minimize();
                    }
                    else {
                        mainWindow.show();
                    }
                });
                mainWindow.on('closed', function () {
                    mainWindow = null;
                });
                menuBuilder = new menu_1["default"](mainWindow);
                menuBuilder.buildMenu();
                // Open urls in the user's browser
                mainWindow.webContents.on('new-window', function (event, url) {
                    event.preventDefault();
                    electron_1.shell.openExternal(url);
                });
                // Remove this if your app does not use auto updates
                // eslint-disable-next-line
                new AppUpdater();
                return [2 /*return*/];
        }
    });
}); };
/**
 * Add event listeners...
 */
electron_1.app.on('window-all-closed', function () {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app
    .whenReady()
    .then(function () {
    createWindow();
    electron_1.app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow === null)
            createWindow();
    });
})["catch"](console.log);
//# sourceMappingURL=main.js.map