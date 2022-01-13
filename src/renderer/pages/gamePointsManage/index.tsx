import { Button, Form, Space } from 'antd'
import { useReducer } from 'react'
import { AddGamePoint } from './components'
import { useGamePointList } from './hooks'

const FormItem = Form.Item

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

export default function GamePointManage() {
  const { gamePointList, getGamePointList } = useGamePointList()
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

      {gamePointList.map((item) => (
        <div key={item.tag}>
          <h3 className="descriptions">
            <Space size="large">
              <span>
                坐标标签：<span>{item.tag}</span>
              </span>
            </Space>
          </h3>

          <ul>
            {item.pointList.map((item) => (
              <li key={item.point.join()}>{`${item.name}(${item.point.join('，')})[${item.shortcut}]`}</li>
            ))}
          </ul>
        </div>
      ))}

      <AddGamePoint
        hideModal={hideAddModal}
        visible={addModalVisible}
        tagList={gamePointList.map((item) => item.tag)}
      />
    </Form>
  )
}
