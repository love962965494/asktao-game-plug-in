import { Tabs } from 'antd'
import BasicFunctionManage from './basicFunctionManage'
import GameTaskManage from './gameTaskManage'

const { TabPane } = Tabs

export default function Pages() {
  return (
    <Tabs>
      <TabPane tab="基础功能" key="1">
        <BasicFunctionManage />
      </TabPane>
      <TabPane tab="游戏任务" key="2">
        <GameTaskManage />
      </TabPane>
    </Tabs>
  )
}
