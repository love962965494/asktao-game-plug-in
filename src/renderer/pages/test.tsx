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

  const handleSetPositionBtnClick = () => {
    ipcRenderer.send('set-position', { x: 2200, y: 100 })
  }

  const handleShowWindowBtnClick = () => {
    ipcRenderer.send('show-window')
  }

  const handleGetImagePosBtnClick = () => {
    ipcRenderer.invoke('get-image-pos').then((res) => {
      console.log('res: ', typeof res)
    })
  }

  return (
    <Space>
      <Button type="primary" onClick={handleToggleTimerBtnClick}>
        切换定时器
      </Button>
      <Button type="primary" onClick={handleSetPositionBtnClick}>
        设置窗口位置
      </Button>
      <Button type="primary" onClick={handleShowWindowBtnClick}>
        显示窗口
      </Button>
      <Button type="primary" onClick={handleGetImagePosBtnClick}>
        获取图片位置
      </Button>
    </Space>
  )
}
