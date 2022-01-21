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
        ipcRenderer.invoke('get-game-point', 6320).then((result) => {
          console.log('result: ', result)
        })
      }, 3000)
    }

    return () => {
      window.clearInterval(interval)
    }
  }, [isTimerStarted])

  useEffect(() => {
    ipcRenderer.on('get-mouse-pos', ({ x, y }: { x: number; y: number }) => {
      console.log('x: ', x)
      console.log('y: ', y)
    })
  }, [])

  const handleToggleTimerBtnClick = () => {
    setIsTimerStarted(!isTimerStarted)
  }

  const handleMoveMouseBtnClick = () => {
    ipcRenderer.send('test-task', [
      { x: 2856, y: 575 },
      { x: 730, y: 325 },
    ])
  }

  return (
    <Space>
      <Button type="primary" onClick={handleMoveMouseBtnClick}>
        移动鼠标
      </Button>
      <Button type="primary" onClick={handleToggleTimerBtnClick}>
        切换定时器
      </Button>
    </Space>
  )
}
