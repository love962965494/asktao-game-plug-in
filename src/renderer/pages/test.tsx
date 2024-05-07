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
        <Button type="primary" onClick={() => ipcRenderer.send('monitor-game')}>
          开启监控
        </Button>
        <Button type="primary" onClick={() => ipcRenderer.send('test-team-leader-by-turn', 1)}>
          测试切换队长
        </Button>
      </Space>
    </div>,
    <div style={{ marginTop: '15px' }}>
      <h3>全民：</h3>
      <Space>
        <Button type="primary" onClick={() => ipcRenderer.send('chu-yao-ren-wu')}>
          除妖任务
        </Button>
        <Button type="primary" onClick={() => ipcRenderer.send('fu-mo-ren-wu')}>
          伏魔任务
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
        <Button type="primary" onClick={() => ipcRenderer.send('yi-jian-ri-chang')}>
          一键日常
        </Button>
      </Space>
    </div>,
    <div style={{ marginTop: '15px' }}>
      <h3>修行：</h3>
      <Space>
        <Button type="primary" onClick={() => ipcRenderer.send('xian-ren-zhi-lu')}>
          仙人指路
        </Button>
        <Button type="primary" onClick={() => ipcRenderer.send('shi-jue-zhen')}>
          十绝阵
        </Button>
        <Button type="primary" onClick={() => ipcRenderer.send('xiu-xing-ren-wu')}>
          修行任务
        </Button>
        <Button type="primary" onClick={() => ipcRenderer.send('xian-jie-shen-bu')}>
          仙界神捕
        </Button>
      </Space>
    </div>,
    <div style={{ marginTop: '15px' }}>
    <h3>限时活动</h3>
    <Space>
      <Button type="primary" onClick={() => ipcRenderer.send('bai-bao-fan-pai')}>
        百宝翻牌
      </Button>
    </Space>
  </div>,
  ]
}
