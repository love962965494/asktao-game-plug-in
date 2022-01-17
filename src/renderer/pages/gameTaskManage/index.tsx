import { Button, Checkbox, Form, Radio, Select, Space } from 'antd'
import { useReducer } from 'react'
import { AddGameTask } from './components'
import { useGameTaskList } from './hooks'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const SelectOption = Select.Option

interface IState {
  addModalVisible: boolean
}

type IActionTypes = 'SET_ADD_MODAL_VISIBLE'

function reducer(state: IState, action: { type: IActionTypes; payload: Partial<IState> }) {
  switch (action.type) {
    case 'SET_ADD_MODAL_VISIBLE':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

const initialState: IState = {
  addModalVisible: false,
}

export default function TaskManage() {
  const { gameTaskList, getGameTaskList } = useGameTaskList()
  const [state, dispatch] = useReducer(reducer, initialState)
  const { addModalVisible } = state

  const showAddModal = () => dispatch({ type: 'SET_ADD_MODAL_VISIBLE', payload: { addModalVisible: true } })
  const hideAddModal = () => dispatch({ type: 'SET_ADD_MODAL_VISIBLE', payload: { addModalVisible: false } })

  return (
    <Form>
      <FormItem>
        <Button type="primary" onClick={showAddModal}>
          添加
        </Button>
      </FormItem>

      <h2 className="title descriptions">
        <Space>
          <span>
            正在执行：<span>师门任务</span>
          </span>
          <span>
            奖励类型：
            <RadioGroup defaultValue="1">
              <Radio value="1">经验奖励</Radio>
              <Radio value="2">道行奖励</Radio>
            </RadioGroup>
          </span>
          <span>
            当前方案：
            <Select defaultValue="1" style={{ width: 150 }}>
              <SelectOption key="1" value="1">
                方案一
              </SelectOption>
              <SelectOption key="2" value="2">
                方案二
              </SelectOption>
              <SelectOption key="3" value="3">
                方案三
              </SelectOption>
            </Select>
          </span>
        </Space>
      </h2>

      {gameTaskList.map((item) => (
        <div>
          <h3 className="title descriptions">
            <Space>
              <span>
                任务类型：<span>{item.tag}</span>
              </span>

              <ul>
                {item.taskList.map((item) => (
                  <li key={item.id}>
                    <Space>
                      <Checkbox>{item.name}</Checkbox>
                      <span>
                        活跃度：<span>{item.liveness}</span>
                      </span>
                    </Space>
                  </li>
                ))}
              </ul>
            </Space>
          </h3>
        </div>
      ))}

      <AddGameTask visible={addModalVisible} hideModal={hideAddModal} />
    </Form>
  )
}
