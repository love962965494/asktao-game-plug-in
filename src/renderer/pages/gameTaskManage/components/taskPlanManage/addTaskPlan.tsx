import { Checkbox, Collapse, Form, Input, Modal } from 'antd'
import { GameTaskList } from 'constants/types'

const FormItem = Form.Item
const CollapsePanel = Collapse.Panel

interface IAddTaskPlan {
  visible: boolean
  hideModal: () => void
  gameTaskList: GameTaskList
}

export function AddTaskPlan(props: IAddTaskPlan) {
  const { visible, hideModal, gameTaskList } = props

  return (
    <Modal title="添加游戏任务方案" visible={visible} onCancel={hideModal}>
      <Form>
        <FormItem label="方案名称">
          <Input />
        </FormItem>
        <FormItem label="任务列表">
          <Collapse>
            {gameTaskList.map((gameTask) => (
              <CollapsePanel key={gameTask.tag} header={gameTask.tag}>
                {gameTask.taskList.map((task) => (
                  <Checkbox value={task.id}>{task.taskName}</Checkbox>
                ))}
              </CollapsePanel>
            ))}
          </Collapse>
        </FormItem>
      </Form>
    </Modal>
  )
}
