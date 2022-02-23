import { createContext } from 'react'
import './App.css'
import Pages from './pages'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/lib/locale/zh_CN'

export const AppContext = createContext({
  ipcRenderer: window.electron.ipcRenderer,
})

export default function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Pages />
    </ConfigProvider>
  )
}
