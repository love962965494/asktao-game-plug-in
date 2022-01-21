import { ICustomIpcRenderer } from 'main/types'

declare global {
  interface Window {
    electron: {
      ipcRenderer: ICustomIpcRenderer
    }
  }
}
