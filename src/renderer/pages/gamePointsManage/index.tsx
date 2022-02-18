import { Button, Form, Space } from 'antd'
import { useReducer } from 'react'
import { AddGamePoint, EditGamePoint } from './components'
import { useAddGamePoint, useEditGamePoint, useGamePointList } from './hooks'
import { GamePoint } from 'constants/types'

const FormItem = Form.Item

interface IState {
  tag?: string
  record?: GamePoint
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

export default function GamePointManage() {
  const { gamePointList, getGamePointList } = useGamePointList()
  const addGamePoint = useAddGamePoint()
  const editGamePoint = useEditGamePoint()
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

  const handleGamePointClick = (record: GamePoint, tag: string) => {
    showEditModal()
    dispatch({ type: 'SET_TAG', payload: { tag } })
    dispatch({ type: 'SET_RECORD', payload: { record } })
  }

  return (
    <Form>
      <FormItem>
        <Space>
          <Button type="primary" onClick={showAddModal}>
            添加
          </Button>
        </Space>
      </FormItem>

      {gamePointList.map((item) => (
        <div key={item.tag}>
          <h3 className="title descriptions">
            <Space size="large">
              <span>
                坐标标签：<span>{item.tag}</span>
              </span>
            </Space>
          </h3>

          <ul className="list">
            {item.pointList.map((pointItem) => (
              <li key={pointItem.id}>
                <a href="#" onClick={handleGamePointClick.bind(null, pointItem, item.tag)}>
                  {`${pointItem.name} (${pointItem.point.x}, ${pointItem.point.y}) ` +
                    (pointItem.shortcut ? `[${pointItem.shortcut}]` : '')}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <AddGamePoint
        hideModal={hideAddModal}
        visible={addModalVisible}
        addGamePoint={addGamePoint}
        refreshData={getGamePointList}
        tagList={gamePointList.map((item) => item.tag)}
      />

      {record && (
        <EditGamePoint
          tag={tag}
          key={record.id}
          record={record}
          hideModal={hideEditModal}
          visible={editModalVisible}
          editGamePoint={editGamePoint}
          refreshData={getGamePointList}
          tagList={gamePointList.map((item) => item.tag)}
        />
      )}
    </Form>
  )
}
