const { contextBridge, ipcRenderer } = require('electron')

const customIpcRenderer = {
  send(eventName, ...args) {
    ipcRenderer.send(eventName, ...args)
  },
  on(channel, func) {
    ipcRenderer.on(channel, (event, ...args) => func(...args))
  },
  once(channel, func) {
    ipcRenderer.once(channel, (event, ...args) => func(...args))
  },
}

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: customIpcRenderer,
})

module.exports = {
  customIpcRenderer,
}
