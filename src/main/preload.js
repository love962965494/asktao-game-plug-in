const { contextBridge, ipcRenderer } = require('electron')

const customIpcRenderer = {
  send(channel, ...args) {
    ipcRenderer.send(channel, ...args)
  },
  on(channel, func) {
    ipcRenderer.on(channel, (event, ...args) => func(...args))
  },
  once(channel, func) {
    ipcRenderer.once(channel, (event, ...args) => func(...args))
  },
  invoke(channel, ...args) {
    return ipcRenderer.invoke(channel, ...args)
  }
}

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: customIpcRenderer,
})

module.exports = {
  customIpcRenderer,
}
