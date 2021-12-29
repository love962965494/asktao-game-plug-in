import { createContext, useContext, useEffect, useState } from 'react'
import { Bitmap } from 'robotjs'
import './App.css'

const AppContext = createContext({
  ipcRenderer: window.electron.ipcRenderer,
})

const Hello = () => {
  const { ipcRenderer } = useContext(AppContext)
  const [isTimerStarted, setIsTimerStarted] = useState<boolean>(true)
  const [imgSrc, setImgSrc] = useState<Bitmap>()

  useEffect(() => {
    ipcRenderer.on('get-mouse-pos', function (pos: { x: number; y: number }) {
      console.log('args: ', pos)
    })

    ipcRenderer.on('get-image', (img: Bitmap) => {
      setImgSrc(img)
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
    ipcRenderer.send('move-mouse', { x: 112, y: 72 })
  }

  const handleToggleTimerBtnClick = () => {
    setIsTimerStarted(!isTimerStarted)
  }

  const handleGetImageBtnClick = () => {
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
      {imgSrc && <img src={imgSrc} alt="截图" />}
    </div>
  )
}

export default function App() {
  return <Hello />
}
