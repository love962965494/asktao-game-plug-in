import { createContext, useContext, useEffect, useState } from 'react'
import { requestByGet, requestByPost } from 'utils/http'
import './App.css'

const AppContext = createContext({
  ipcRenderer: window.electron.ipcRenderer,
})

const Hello = () => {
  const { ipcRenderer } = useContext(AppContext)
  const [isTimerStarted, setIsTimerStarted] = useState<boolean>(true)

  useEffect(() => {
    ipcRenderer.on('get-mouse-pos', function (pos: { x: number; y: number }) {
      console.log('args: ', pos)
    })
  }, [])

  useEffect(() => {
    let interval: number
    if (isTimerStarted) {
      interval = window.setInterval(() => {
        window.electron.ipcRenderer.send('get-mouse-pos')
      }, 3000)
    }

    return () => {
      console.log('return hhh')
      window.clearInterval(interval)
    }
  }, [isTimerStarted])

  const handleMoveMouseBtnClick = () => {
    ipcRenderer.send('move-mouse', { x: 439, y: 929 })
  }

  const handleToggleTimerBtnClick = () => {
    setIsTimerStarted(!isTimerStarted)
  }

  const handleGetImageBtnClick = async () => {
    ipcRenderer.send('get-image', { x: 6, y: 91 })
  }

  return (
    <div>
      <button type="button" onClick={handleMoveMouseBtnClick}>
        点击移动
      </button>
      <button type="button" onClick={handleToggleTimerBtnClick}>
        切换定时器
      </button>
      <button type="button" onClick={handleGetImageBtnClick}>
        获取截图
      </button>
    </div>
  )
}

export default function App() {
  return <Hello />
}
