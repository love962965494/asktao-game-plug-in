"use strict";
var _a = require('electron'), contextBridge = _a.contextBridge, ipcRenderer = _a.ipcRenderer;
contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        myPing: function () {
            ipcRenderer.send('ipc-example', 'ping');
        },
        on: function (channel, func) {
            var validChannels = ['ipc-example'];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender`
                ipcRenderer.on(channel, function (event) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    return func.apply(void 0, args);
                });
            }
        },
        once: function (channel, func) {
            var validChannels = ['ipc-example'];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender`
                ipcRenderer.once(channel, function (event) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    return func.apply(void 0, args);
                });
            }
        }
    }
});
//# sourceMappingURL=preload.js.map