import { Tabs } from 'antd'
import AccountListManage from './accountListManage'
import GamePointsManage from './gamePointsManage'
import GameTaskManage from './gameTaskManage'

const { TabPane } = Tabs

export default function Pages() {
  return (
    <Tabs>
      <TabPane tab="账户管理" key="1">
        <AccountListManage />
      </TabPane>
      <TabPane tab="任务管理" key="2">
        <GameTaskManage />
      </TabPane>
      <TabPane tab="坐标管理" key="3">
        <GamePointsManage />
      </TabPane>
    </Tabs>
  )
}
