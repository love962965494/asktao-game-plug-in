import { Checkbox, Collapse, Form, Input, Modal } from 'antd'
import { GameTaskList, GameTaskPlan } from 'constants/types'
import { FieldData } from 'rc-field-form/lib/interface'
import { useEffect, useState } from 'react'
import { simpleCloneKeep } from 'utils/toolkits'

const FormItem = Form.Item
const CollapsePanel = Collapse.Panel

interface IAddTaskPlan {
  visible: boolean
  hideModal: () => void
  refreshData: () => void
  gameTaskList: GameTaskList
  addGameTaskPlan: (gameTaskPlan: GameTaskPlan) => Promise<void>
}

export function AddTaskPlan(props: IAddTaskPlan) {
  const { visible, hideModal, gameTaskList, addGameTaskPlan, refreshData } = props
  const [form] = Form.useForm()
  const [newGameTaskList, setNewGameTaskList] = useState<GameTaskList>([])

  useEffect(() => {
    setNewGameTaskList(simpleCloneKeep(gameTaskList))
  }, [gameTaskList])

  const handleFormSubmit = () => {
    form
      .validateFields()
      .then(async (gameTaskPlan: GameTaskPlan) => {
        await addGameTaskPlan(gameTaskPlan)
        handleHideModal()
        refreshData()
      })
      .catch((error) => {
        console.log('handleFormSubmit error: ', error)
      })
  }

  const handleHideModal = () => {
    form.resetFields()
    hideModal()
  }

  return (
    <Modal title="添加游戏任务方案" visible={visible} onCancel={handleHideModal} onOk={handleFormSubmit}>
      <Form form={form} labelCol={{ span: 4 }}>
        <FormItem label="方案名称" name="planName" rules={[{ required: true, message: '方案名称不能为空' }]}>
          <Input />
        </FormItem>
        <FormItem label="任务列表">
          <Collapse defaultActiveKey={newGameTaskList.map((gameTask) => gameTask.tag)}>
            {newGameTaskList.map((gameTask, gameTaskIndex) => (
              <CollapsePanel key={gameTask.tag} header={gameTask.tag} forceRender>
                <FormItem noStyle initialValue={gameTask.tag} name={['gameTaskList', gameTaskIndex, 'tag']}>
                  <Input style={{ display: 'none' }} />
                </FormItem>
                <ul className="item">
                  {gameTask.taskList.map((task, taskListIndex) => (
                    <li key={task.id}>
                      <FormItem
                        noStyle
                        initialValue={task}
                        name={['gameTaskList', gameTaskIndex, 'taskList', taskListIndex]}
                      >
                        <Input style={{ display: 'none' }} />
                      </FormItem>
                      <FormItem
                        noStyle
                        valuePropName="checked"
                        name={['gameTaskList', gameTaskIndex, 'taskList', taskListIndex, 'checked']}
                      >
                        <Checkbox>{task.taskName}</Checkbox>
                      </FormItem>
                    </li>
                  ))}
                </ul>
              </CollapsePanel>
            ))}
          </Collapse>
        </FormItem>
      </Form>
    </Modal>
  )
}
