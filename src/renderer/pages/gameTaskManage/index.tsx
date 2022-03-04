import { Button, Form, Space, Select } from 'antd'
import { GameTask } from 'constants/types'
import { useContext, useReducer } from 'react'
import { AppContext } from 'renderer/App'
import { useGameAccountList } from '../accountListManage/hooks'
import { AddGameTask, EditGameTask, TaskPlanManage } from './components'
import {
  useAddGameTask,
  useAddGameTaskPlan,
  useEditGameTask,
  useEditGameTaskPlan,
  useGameTaskList,
  useGameTaskPlanList,
  useRemoveGameTaskPlan,
} from './hooks'

const FormItem = Form.Item
const SelectOption = Select.Option

type PageType = 'taskManage' | 'taskPlanManage'
interface IState {
  tag?: string
  record?: GameTask
  addModalVisible: boolean
  editModalVisible: boolean
  pageType: PageType
}

type IActionTypes = 'SET_TAG' | 'SET_RECORD' | 'SET_ADD_MODAL_VISIBLE' | 'SET_EDIT_MODAL_VISIBLE' | 'SET_PAGE_TYPE'

function reducer(state: IState, action: { type: IActionTypes; payload: Partial<IState> }) {
  switch (action.type) {
    case 'SET_TAG':
    case 'SET_RECORD':
    case 'SET_PAGE_TYPE':
    case 'SET_ADD_MODAL_VISIBLE':
    case 'SET_EDIT_MODAL_VISIBLE':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

const initialState: IState = {
  tag: undefined,
  record: undefined,
  pageType: 'taskManage',
  addModalVisible: false,
  editModalVisible: false,
}

export default function TaskManage() {
  const [form] = Form.useForm()
  const { ipcRenderer } = useContext(AppContext)
  const { gameAccountList } = useGameAccountList()
  const { gameTaskList, getGameTaskList } = useGameTaskList()
  const { gameTaskPlanList, getGameTaskPlanList } = useGameTaskPlanList()
  const addGameTask = useAddGameTask()
  const editGameTask = useEditGameTask()
  const addGameTaskPlan = useAddGameTaskPlan()
  const editGameTaskPlan = useEditGameTaskPlan()
  const removeGameTaskPlan = useRemoveGameTaskPlan()
  const [state, dispatch] = useReducer(reducer, initialState)
  const { tag, record, pageType, addModalVisible, editModalVisible } = state

  const showAddModal = () => dispatch({ type: 'SET_ADD_MODAL_VISIBLE', payload: { addModalVisible: true } })
  const hideAddModal = () => dispatch({ type: 'SET_ADD_MODAL_VISIBLE', payload: { addModalVisible: false } })

  const showEditModal = () => dispatch({ type: 'SET_EDIT_MODAL_VISIBLE', payload: { editModalVisible: true } })
  const hideEditModal = () => {
    dispatch({ type: 'SET_TAG', payload: { tag: undefined } })
    dispatch({ type: 'SET_RECORD', payload: { record: undefined } })
    dispatch({ type: 'SET_EDIT_MODAL_VISIBLE', payload: { editModalVisible: false } })
  }

  const handleGameTaskClick = (record: GameTask, tag: string) => {
    showEditModal()
    dispatch({ type: 'SET_TAG', payload: { tag } })
    dispatch({ type: 'SET_RECORD', payload: { record } })
  }

  const changePageType = () =>
    dispatch({
      type: 'SET_PAGE_TYPE',
      payload: { pageType: pageType === 'taskManage' ? 'taskPlanManage' : 'taskManage' },
    })

  const handleExecuteBtnClick = () => {
    form
      .validateFields()
      .then(({ taskPlan }: { taskPlan: string }) => {
        ipcRenderer.send('test-execute-plan', taskPlan)
      })
      .catch((error) => {
        console.log('handleExecuteBtnClick error: ', error)
      })
  }

  return (
    <>
      {pageType === 'taskManage' && (
        <Form form={form}>
          <FormItem label="方案选择">
            <Space>
              <FormItem noStyle name="taskPlan" rules={[{ required: true, message: '方案不能为空' }]}>
                <Select style={{ width: 200 }}>
                  {gameTaskPlanList.map((gameTaskPlan) => (
                    <SelectOption key={gameTaskPlan.id}>
                      <span>{gameTaskPlan.planName}</span>
                    </SelectOption>
                  ))}
                </Select>
              </FormItem>
              <Button type="ghost" danger onClick={handleExecuteBtnClick}>
                一键执行
              </Button>
              <Button type="link" onClick={changePageType}>
                方案配置
              </Button>
            </Space>
          </FormItem>

          <FormItem style={{ marginTop: 50 }}>
            <Button type="primary" onClick={showAddModal}>
              添加
            </Button>
          </FormItem>

          {gameTaskList.map((item) => (
            <div key={item.tag} style={{ marginBottom: 30 }}>
              <h3 className="title descriptions">
                <Space size="large">
                  <span>
                    任务类型：<span>{item.tag}</span>
                  </span>
                </Space>
              </h3>

              <ul className="list">
                {item.taskList.map((taskItem) => (
                  <li key={taskItem.id}>
                    <a href="#" onClick={handleGameTaskClick.bind(null, taskItem, item.tag)}>
                      {taskItem.taskName}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <AddGameTask
            hideModal={hideAddModal}
            visible={addModalVisible}
            addGameTask={addGameTask}
            refreshData={getGameTaskList}
            key={addModalVisible.toString()}
            tagList={gameTaskList.map((item) => item.tag)}
          />

          {record && (
            <EditGameTask
              tag={tag}
              key={record.id}
              record={record}
              hideModal={hideEditModal}
              visible={editModalVisible}
              editGameTask={editGameTask}
              refreshData={getGameTaskList}
              tagList={gameTaskList.map((item) => item.tag)}
            />
          )}
        </Form>
      )}
      {pageType === 'taskPlanManage' && (
        <TaskPlanManage
          gameTaskList={gameTaskList}
          changePageType={changePageType}
          gameAccountList={gameAccountList}
          addGameTaskPlan={addGameTaskPlan}
          editGameTaskPlan={editGameTaskPlan}
          gameTaskPlanList={gameTaskPlanList}
          removeGameTaskPlan={removeGameTaskPlan}
          getGameTaskPlanList={getGameTaskPlanList}
        />
      )}
    </>
  )
}
