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

  const handleYouDaoBtnClick = () => {
    ipcRenderer.send('test-youdao')
  }

  const handleStartGameBtnClick = () => {
    ipcRenderer.send('test-start-game')
  }

  const handleWangYiBtnClick = () => {
    ipcRenderer.send('test-wangyi')
  }

  const handleStartAllBtnClick = () => {
    ipcRenderer.send('test-start-all')
  }

  const handleCloseBtnClick = () => {
    ipcRenderer.send('test-close-window')
  }

  return (
    <Space>
      <Button type="primary" onClick={handleToggleTimerBtnClick}>
        切换定时器
      </Button>
      <Button type="primary" onClick={handleYouDaoBtnClick}>
        有道词典
      </Button>
      <Button type="primary" onClick={handleStartGameBtnClick}>
        启动游戏
      </Button>
      <Button type="primary" onClick={handleWangYiBtnClick}>
        网易云音乐
      </Button>
      <Button type="primary" onClick={handleStartAllBtnClick}>
        一键执行
      </Button>
      <Button type="ghost" danger onClick={handleCloseBtnClick}>
        关闭所有窗口
      </Button>
    </Space>
  )
}
