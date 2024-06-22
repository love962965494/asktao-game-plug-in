import { Button, Modal, Select, Space } from 'antd'
import { useContext, useState } from 'react'
import { AppContext } from 'renderer/App'

export default function GameTaskManage() {
  const { ipcRenderer } = useContext(AppContext)
  const [huangJinLuoPanModalVisible, setHuangJinLuoPanModalVisible] = useState(false)
  const [huangJinLuoPanCity, setHuangJinLuoPanCity] = useState('')

  return (
    <>
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
      </div>

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
      </div>

      <div style={{ marginTop: '15px' }}>
        <h3>日常：</h3>
        <Space>
          <Button type="primary" onClick={() => ipcRenderer.send('yi-jian-qian-dao')}>
            一键签到
          </Button>
          <Button type="primary" onClick={() => ipcRenderer.send('yi-jian-ri-chang')}>
            一键日常
          </Button>
          <Button type="primary" onClick={() => ipcRenderer.send('shi-men-ren-wu')}>
            师门任务
          </Button>
          <Button type="primary" onClick={() => ipcRenderer.send('wa-kuang')}>
            挖矿
          </Button>
          <Button type="primary" onClick={() => ipcRenderer.send('xiu-lian-fa-bao')}>
            修炼法宝
          </Button>
        </Space>
      </div>

      <div style={{ marginTop: '15px' }}>
        <h3>修行：</h3>
        <Space>
          <Button type="primary" onClick={() => ipcRenderer.send('xian-ren-zhi-lu')}>
            仙人指路
          </Button>
          {/* <Button type="primary" onClick={() => ipcRenderer.send('shi-jue-zhen')}>
          十绝阵
        </Button>
        <Button type="primary" onClick={() => ipcRenderer.send('xiu-xing-ren-wu')}>
          修行任务
        </Button> */}
          <Button type="primary" onClick={() => ipcRenderer.send('xian-jie-shen-bu')}>
            仙界神捕
          </Button>
          {/* <Button type="primary" onClick={() => ipcRenderer.send('xun-xian-ren-wu')}>
          寻仙任务
        </Button> */}
          <Button type="primary" onClick={() => ipcRenderer.send('shua-dai-jin')}>
            刷代金
          </Button>
        </Space>
      </div>

      <div style={{ marginTop: '15px' }}>
        <h3>限时活动：</h3>
        <Space>
          <Button type="primary" onClick={() => ipcRenderer.send('yu-wai-feng-yun')}>
            域外风云
          </Button>
          <Button type="primary" onClick={() => ipcRenderer.send('bai-bao-fan-pai')}>
            百宝翻牌
          </Button>
          <Button type="primary" onClick={() => ipcRenderer.send('tian-xu-mi-fu')}>
            天墟秘府
          </Button>
          <Button type="primary" onClick={() => setHuangJinLuoPanModalVisible(true)}>
            黄金罗盘
          </Button>
          <Modal
            title="选择地图"
            visible={huangJinLuoPanModalVisible}
            onOk={() => {
              ipcRenderer.send('huang-jin-luo-pan', huangJinLuoPanCity)
              setHuangJinLuoPanModalVisible(false)
            }}
            onCancel={() => setHuangJinLuoPanModalVisible(false)}
          >
            黄金罗盘地图：
            <Select style={{ width: 300 }} placeholder="选择" value={huangJinLuoPanCity} onChange={(value) => setHuangJinLuoPanCity(value)}>
              <Select.Option value="桃柳林">桃柳林</Select.Option>
              <Select.Option value="轩辕庙">轩辕庙</Select.Option>
              <Select.Option value="风月谷">风月谷</Select.Option>
              <Select.Option value="北海沙滩">北海沙滩</Select.Option>
              <Select.Option value="揽仙镇外">揽仙镇外</Select.Option>
              <Select.Option value="官道南">官道南</Select.Option>
            </Select>
          </Modal>
        </Space>
      </div>
    </>
  )
}
