import { Form, Button, Space } from 'antd'
import { GameTaskPlanList } from 'constants/types'
import { useState } from 'react'

const FormItem = Form.Item

interface ITaskPlanManage {
  gameTaskPlanList: GameTaskPlanList
}

export function TaskPlanManage(props: ITaskPlanManage) {
  const { gameTaskPlanList } = props
  const [visible, setVisible] = useState(false)

  const showAddModal = () => setVisible(true)
  const hideAddModal = () => setVisible(false)

  return (
    <Form>
      <FormItem>
        <Space>
          <Button type="link">返回</Button>
          <Button type="primary">添加</Button>
        </Space>
      </FormItem>
    </Form>
  )
}
