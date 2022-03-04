import { Form, Button, Space, Checkbox, Collapse, Modal } from 'antd'
import { GameAccountList, GameTaskList, GameTaskPlan, GameTaskPlanList } from 'constants/types'
import { useReducer } from 'react'
import { AddTaskPlan } from './addTaskPlan'
import { EditTaskPlan } from './editTaskPlan'

const FormItem = Form.Item
const CollapsePanel = Collapse.Panel

interface ITaskPlanManage {
  changePageType: () => void
  gameTaskList: GameTaskList
  gameAccountList: GameAccountList
  gameTaskPlanList: GameTaskPlanList
  getGameTaskPlanList: () => Promise<void>
  removeGameTaskPlan: (id: string) => Promise<void>
  addGameTaskPlan: (gameTaskPlan: GameTaskPlan) => Promise<void>
  editGameTaskPlan: (gameTaskPlan: GameTaskPlan) => Promise<void>
}

type IActionTypes = 'SET_RECORD' | 'SET_ADD_MODAL_VISIBLE' | 'SET_EDIT_MODAL_VISIBLE'
interface IState {
  record?: GameTaskPlan
  addModalVisible: boolean
  editModalVisible: boolean
}

function reducer(state: IState, action: { type: IActionTypes; payload: Partial<IState> }) {
  switch (action.type) {
    case 'SET_RECORD':
    case 'SET_ADD_MODAL_VISIBLE':
    case 'SET_EDIT_MODAL_VISIBLE': {
      return { ...state, ...action.payload }
    }
    default:
      return state
  }
}

const initialState: IState = {
  addModalVisible: false,
  editModalVisible: false,
}

export function TaskPlanManage(props: ITaskPlanManage) {
  const {
    gameTaskList,
    changePageType,
    gameAccountList,
    addGameTaskPlan,
    gameTaskPlanList,
    editGameTaskPlan,
    removeGameTaskPlan,
    getGameTaskPlanList,
  } = props
  const [state, dispatch] = useReducer(reducer, initialState)
  const { record, addModalVisible, editModalVisible } = state

  const showAddModal = () => dispatch({ type: 'SET_ADD_MODAL_VISIBLE', payload: { addModalVisible: true } })
  const hideAddModal = () => dispatch({ type: 'SET_ADD_MODAL_VISIBLE', payload: { addModalVisible: false } })

  const showEditModal = () => dispatch({ type: 'SET_EDIT_MODAL_VISIBLE', payload: { editModalVisible: true } })
  const hideEditModal = () => dispatch({ type: 'SET_EDIT_MODAL_VISIBLE', payload: { editModalVisible: false } })

  const handleEditPlanBtnClick = (gameTaskPlan: GameTaskPlan) => {
    showEditModal()
    dispatch({ type: 'SET_RECORD', payload: { record: gameTaskPlan } })
  }

  const handleDeletePlanBtnClick = (id: string) => {
    Modal.confirm({
      type: 'warning',
      content: '是否删除该方案？',
      onOk: async () => {
        await removeGameTaskPlan(id)
        getGameTaskPlanList()
      },
    })
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
              <span>
                账户分组：<span>{taskPlan.accountGroups.join('、')}</span>
              </span>
              <Button type="ghost" danger onClick={handleEditPlanBtnClick.bind(null, taskPlan)}>
                修改方案
              </Button>
              <Button type="ghost" danger onClick={handleDeletePlanBtnClick.bind(null, taskPlan.id)}>
                删除方案
              </Button>
            </Space>
          </h3>

          <Collapse defaultActiveKey={gameTaskList.map((gameTask) => gameTask.tag)}>
            {gameTaskList.map((gameTask) => (
              <CollapsePanel header={gameTask.tag} key={gameTask.tag}>
                <ul>
                  {gameTask.taskList.map((taskInfo) => (
                    <li key={taskInfo.id}>
                      <Checkbox
                        disabled
                        checked={
                          taskPlan.gameTaskList
                            .find((item) => item.tag === gameTask.tag)
                            ?.taskList.find((item) => item.id === taskInfo.id)?.checked
                        }
                      >
                        {taskInfo.taskName}
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
        hideModal={hideAddModal}
        visible={addModalVisible}
        gameTaskList={gameTaskList}
        gameAccountList={gameAccountList}
        refreshData={getGameTaskPlanList}
        addGameTaskPlan={addGameTaskPlan}
      />

      <EditTaskPlan
        record={record}
        hideModal={hideEditModal}
        visible={editModalVisible}
        gameTaskList={gameTaskList}
        gameAccountList={gameAccountList}
        refreshData={getGameTaskPlanList}
        editGameTaskPlan={editGameTaskPlan}
      />
    </Form>
  )
}
