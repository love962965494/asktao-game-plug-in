import { Form, Button, Space, Checkbox, Collapse, Input } from 'antd'
import { GameTaskList, GameTaskPlan, GameTaskPlanList } from 'constants/types'
import { useEffect, useState } from 'react'
import { AddTaskPlan } from './addTaskPlan'

const FormItem = Form.Item
const CollapsePanel = Collapse.Panel

interface ITaskPlanManage {
  gameTaskList: GameTaskList
  gameTaskPlanList: GameTaskPlanList
  changePageType: () => void
  getGameTaskPlanList: () => Promise<void>
  addGameTaskPlan: (gameTaskPlan: GameTaskPlan) => Promise<void>
}

export function TaskPlanManage(props: ITaskPlanManage) {
  const { gameTaskPlanList, changePageType, gameTaskList, addGameTaskPlan, getGameTaskPlanList } = props
  const [visible, setVisible] = useState(false)

  const showAddModal = () => setVisible(true)
  const hideAddModal = () => setVisible(false)

  const handleEditPlanBtnClick = (planName: string) => {
    console.log('planName: ', planName)
  }

  return (
    <Form>
      <FormItem>
        <Space>
          <Button type="link" onClick={changePageType}>
            返回
          </Button>
          <Button type="primary" onClick={showAddModal}>
            添加
          </Button>
        </Space>
      </FormItem>

      {gameTaskPlanList.map((taskPlan) => (
        <div key={taskPlan.id} style={{ marginBottom: 30 }}>
          <h3 className="title descriptions">
            <Space size="large">
              <span>
                任务方案：<span>{taskPlan.planName}</span>
              </span>
              <Button type="ghost" danger onClick={handleEditPlanBtnClick.bind(null, taskPlan.planName)}>
                修改方案
              </Button>
              <Button type="ghost" danger>
                删除方案
              </Button>
            </Space>
          </h3>

          <Collapse defaultActiveKey={taskPlan.gameTaskList.map((gameTask) => gameTask.tag)}>
            {taskPlan.gameTaskList.map((gameTask) => (
              <CollapsePanel header={gameTask.tag} key={gameTask.tag}>
                <ul className="item">
                  {gameTask.taskList.map((task) => (
                    <li key={task.id}>
                      <Checkbox checked={task.checked} disabled>
                        {task.taskName}
                      </Checkbox>
                    </li>
                  ))}
                </ul>
              </CollapsePanel>
            ))}
          </Collapse>
        </div>
      ))}

      <AddTaskPlan
        visible={visible}
        hideModal={hideAddModal}
        gameTaskList={gameTaskList}
        refreshData={getGameTaskPlanList}
        addGameTaskPlan={addGameTaskPlan}
      />
    </Form>
  )
}
