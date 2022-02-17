import { Button, Form, Space, Select } from 'antd'
import { GameTask } from 'constants/types'
import { useReducer } from 'react'
import { AddGameTask, EditGameTask } from './components'
import { useAddGameTask, useEditGameTask, useGameTaskList, useGameTaskPlanList } from './hooks'
import styles from './gameTaskManage.module.scss'

const FormItem = Form.Item
const SelectOption = Select.Option

interface IState {
  tag?: string
  record?: GameTask
  addModalVisible: boolean
  editModalVisible: boolean
}

type IActionTypes = 'SET_TAG' | 'SET_RECORD' | 'SET_ADD_MODAL_VISIBLE' | 'SET_EDIT_MODAL_VISIBLE'

function reducer(state: IState, action: { type: IActionTypes; payload: Partial<IState> }) {
  switch (action.type) {
    case 'SET_TAG':
    case 'SET_RECORD':
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
  addModalVisible: false,
  editModalVisible: false,
}

export default function TaskManage() {
  const { gameTaskList, getGameTaskList } = useGameTaskList()
  const { gameTaskPlanList, getGameTaskPlanList } = useGameTaskPlanList()
  const addGameTask = useAddGameTask()
  const editGameTask = useEditGameTask()
  const [state, dispatch] = useReducer(reducer, initialState)
  const { tag, record, addModalVisible, editModalVisible } = state

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

  return (
    <Form>
      <FormItem label="方案选择">
        <Space>
          <Select style={{ width: 200 }}>
            {gameTaskPlanList.map((gameTaskPlan) => (
              <SelectOption key={gameTaskPlan.id} className={styles.option}>
                <span>{gameTaskPlan.planName}</span>
              </SelectOption>
            ))}
          </Select>
          <Button type="ghost" danger>
            一键执行
          </Button>
          <Button type="link">方案配置</Button>
        </Space>
      </FormItem>

      <FormItem style={{ marginTop: 50 }}>
        <Button type="primary" onClick={showAddModal}>
          添加
        </Button>
      </FormItem>

      {gameTaskList.map((item) => (
        <div key={item.tag}>
          <h3 className="title descriptions">
            <Space size="large">
              <span>
                任务类型：<span>{item.tag}</span>
              </span>
            </Space>
          </h3>

          <ul className={styles.list}>
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
  )
}
