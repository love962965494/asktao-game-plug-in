import { Button, Space } from 'antd'
import { useContext, useState } from 'react'
import { AppContext } from 'renderer/App'

export default function BasicFunctionManage() {
  const { ipcRenderer } = useContext(AppContext)
  const [isOpenShiChen, setIsOpenShiChen] = useState(false)

  return (
    <>
      <div style={{ marginTop: '15px' }}>
        <h3>常用功能：</h3>
        <Space>
          <Button
            type="primary"
            onClick={() => {
              setIsOpenShiChen(() => {
                const status = !isOpenShiChen
                ipcRenderer.send('shi-chen-yun-shi', status)

                return status
              })
            }}
          >
            {isOpenShiChen ? '时辰运势-已开启' : '时辰运势-已关闭'}
          </Button>
          <Button type="primary" onClick={() => ipcRenderer.send('ru-yi', true)}>
            如意开启
          </Button>
          <Button type="primary" onClick={() => ipcRenderer.send('ru-yi', false)}>
            如意关闭
          </Button>
          <Button type="primary" onClick={() => ipcRenderer.send('xun-huan-zi-dong')}>
            循环自动
          </Button>
        </Space>
      </div>
    </>
  )
}
