import { Button, Space } from 'antd'
import { useContext } from 'react'
import { AppContext } from 'renderer/App'

export default function Test() {
  const { ipcRenderer } = useContext(AppContext)

  return [
    <div>
      <Space>
        <Button type="primary" onClick={() => ipcRenderer.send('start-game')}>
          启动游戏
        </Button>
        <Button type="primary" onClick={() => ipcRenderer.send('monitor-game-login-failed')}>
          测试登录失败
        </Button>
        <Button type="primary" onClick={() => ipcRenderer.send('test-team-leader-by-turn', 1)}>
          测试切换队长
        </Button>
        <Button type="primary" onClick={() => ipcRenderer.send('xian-ren-zhi-lu')}>
          仙人指路
        </Button>
      </Space>
    </div>,
    <div style={{ marginTop: '15px' }}>
      <h3>全民：</h3>
      <Space>
        <Button type="primary" onClick={() => ipcRenderer.send('quan-min-shua-dao')}>
          全民刷道
        </Button>
        <Button type="primary" onClick={() => ipcRenderer.send('quan-min-sheng-ji')}>
          全民升级
        </Button>
      </Space>
    </div>,
    <div style={{ marginTop: '15px' }}>
      <h3>日常签到：</h3>
      <Space>
        <Button type="primary" onClick={() => ipcRenderer.send('yi-jian-qian-dao')}>
          一键签到
        </Button>
      </Space>
    </div>,
  ]
}
