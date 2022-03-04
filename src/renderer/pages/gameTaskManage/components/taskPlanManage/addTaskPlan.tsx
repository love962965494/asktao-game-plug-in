import { Checkbox, Collapse, Form, Input, Modal, Select } from 'antd'
import { GameAccountList, GameTaskList, GameTaskPlan } from 'constants/types'
import { useEffect, useReducer, useState } from 'react'
import { simpleCloneKeep } from 'utils/toolkits'

const FormItem = Form.Item
const SelectOption = Select.Option
const CollapsePanel = Collapse.Panel

export interface IAddTaskPlan {
  visible: boolean
  record?: GameTaskPlan
  hideModal: () => void
  refreshData: () => void
  gameTaskList: GameTaskList
  gameAccountList: GameAccountList
  addGameTaskPlan?: (gameTaskPlan: GameTaskPlan) => Promise<void>
  editGameTaskPlan?: (gameTaskPlan: GameTaskPlan) => Promise<void>
}

export function AddTaskPlan(props: IAddTaskPlan) {
  const { record, visible, hideModal, gameTaskList, gameAccountList, addGameTaskPlan, editGameTaskPlan, refreshData } =
    props
  const [form] = Form.useForm()
  const [newGameTaskList, setNewGameTaskList] = useState<GameTaskList>([])
  const [_, forceUpdate] = useReducer((x) => x + 1, 0)

  useEffect(() => {
    setNewGameTaskList(simpleCloneKeep(gameTaskList))
  }, [gameTaskList])

  useEffect(() => {
    if (record) {
      const gameTaskList = newGameTaskList.map((item) => {
        for (const task of item.taskList) {
          const taskGroup = record.gameTaskList.find((taskItem) => taskItem.tag === item.tag)
          const temp = taskGroup?.taskList?.find((item) => item.id === task.id)
          task.checked = temp?.checked ?? false
        }

        return item
      })
      form.setFieldsValue({
        planName: record.planName,
        accountGroups: record.accountGroups,
        gameTaskList,
      })
      forceUpdate()
    }
  }, [record, newGameTaskList])

  const handleFormSubmit = () => {
    form
      .validateFields()
      .then(async (gameTaskPlan: GameTaskPlan) => {
        if (record) {
          await editGameTaskPlan?.({ ...gameTaskPlan, id: record.id })
        } else {
          await addGameTaskPlan?.(gameTaskPlan)
        }
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
    <Modal
      visible={visible}
      onOk={handleFormSubmit}
      onCancel={handleHideModal}
      title={record ? '修改游戏任务方案' : '添加游戏任务方案'}
    >
      <Form form={form} labelCol={{ span: 4 }}>
        <FormItem label="方案名称" name="planName" rules={[{ required: true, message: '方案名称不能为空' }]}>
          <Input />
        </FormItem>
        <FormItem label="账号分组" name="accountGroups" rules={[{ required: true, message: '账户分组不能为空' }]}>
          <Select mode="multiple">
            {gameAccountList.map((item) => (
              <SelectOption key={item.groupName}>{item.groupName}</SelectOption>
            ))}
          </Select>
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
                        initialValue={task.id}
                        name={['gameTaskList', gameTaskIndex, 'taskList', taskListIndex, 'id']}
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
