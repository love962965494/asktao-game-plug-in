import { CustomIpcRenderer } from 'main/types'

declare global {
  interface Window {
    electron: {
      ipcRenderer: CustomIpcRenderer
    }
  }
}
