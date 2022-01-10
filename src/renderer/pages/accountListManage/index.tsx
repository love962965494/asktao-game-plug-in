import { Form, Button, List, Avatar, Spin } from 'antd'
import { GameAccount } from 'constants/types'
import { useReducer } from 'react'
import { AddAccount } from './components'
import { useAddAccount, useGameAccountList, useGameServerGroup } from './hooks'

const FormItem = Form.Item
const ListItem = List.Item
const ListItemMeta = ListItem.Meta

interface IState {
  addModalVisible: boolean
  editModalVisible: boolean
}

type IActionTypes = 'SET_ADD_MODAL_VISIBLE' | 'SET_EDIT_MODAL_VISIBLE'

function reducer(state: IState, action: { type: IActionTypes; payload: Partial<IState> }) {
  switch (action.type) {
    case 'SET_ADD_MODAL_VISIBLE':
    case 'SET_EDIT_MODAL_VISIBLE':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

const initialState: IState = { addModalVisible: false, editModalVisible: false }

export default function AccountListManage() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { addModalVisible } = state

  const { loading, gameAccountList, getGameAccountList } = useGameAccountList()
  const addAccount = useAddAccount()

  const showAddModal = () => dispatch({ type: 'SET_ADD_MODAL_VISIBLE', payload: { addModalVisible: true } })
  const hideAddModal = () => dispatch({ type: 'SET_ADD_MODAL_VISIBLE', payload: { addModalVisible: false } })

  return (
    <Form>
      <FormItem>
        <Button type="primary" onClick={showAddModal}>
          添加
        </Button>
      </FormItem>
      {gameAccountList.map((group) => (
        <Spin spinning={loading} key={group.groupName}>
          <div className="title">{group.groupName}</div>
          <List
            itemLayout="horizontal"
            dataSource={group.accountList}
            renderItem={(item) => (
              <ListItem>
                <ListItemMeta avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />} title={item.roleInfo.name} />
              </ListItem>
            )}
          />
        </Spin>
      ))}

      <AddAccount visible={addModalVisible} hideModal={hideAddModal} addAccount={addAccount} />
    </Form>
  )
}
