import { Button, Space } from 'antd'
import { useContext, useEffect, useState } from 'react'
import { AppContext } from 'renderer/App'

export default function Test() {
  const { ipcRenderer } = useContext(AppContext)
  const [isTimerStarted, setIsTimerStarted] = useState<boolean>(false)

  useEffect(() => {
    let interval: number
    if (isTimerStarted) {
      interval = window.setInterval(() => {
        ipcRenderer.invoke('get-game-point', 10272).then((result) => {
          console.log('result: ', result)
        })
      }, 3000)
    }

    return () => {
      window.clearInterval(interval)
    }
  }, [isTimerStarted])

  const handleToggleTimerBtnClick = () => {
    setIsTimerStarted(!isTimerStarted)
  }

  const handleStartGameBtnClick = () => {
    ipcRenderer.send('test-start-game')
  }

  const handleCloseBtnClick = () => {
    ipcRenderer.send('test-close-window')
  }

  return (
    <Space>
      <Button type="primary" onClick={handleToggleTimerBtnClick}>
        切换定时器
      </Button>
      <Button type="primary" onClick={handleStartGameBtnClick}>
        启动游戏
      </Button>
      <Button type="ghost" danger onClick={handleCloseBtnClick}>
        关闭所有窗口
      </Button>
    </Space>
  )
}
