import { Form, Button, List, Avatar, Space } from 'antd'
import { useReducer } from 'react'
import { AddAccount } from './components'
import { useAddAccount, useGameAccountList } from './hooks'
import styles from './accountListManage.module.scss'

const FormItem = Form.Item
const ListItem = List.Item
const ListItemMeta = ListItem.Meta

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

const initialState: IState = { addModalVisible: false }

export default function AccountListManage() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { addModalVisible } = state

  const { gameAccountList, getGameAccountList } = useGameAccountList()
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
        <div key={group.groupName} className={styles.groupList}>
          <h3 className="descriptions">
            <Space size="large">
              <span>
                账户分组：<span>{group.groupName}</span>
              </span>
              <span>
                服务区组：<span>{group.serverGroup.join(' / ')}</span>
              </span>
              <Button type="ghost" danger>
                一键登录
              </Button>
              <Button type="ghost" danger>
                一键换线
              </Button>
            </Space>
          </h3>
          <List
            itemLayout="vertical"
            dataSource={group.accountList}
            renderItem={(item) => (
              <ListItem key={item.account} className="descriptions">
                <ListItemMeta
                  avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
                  title={
                    <div className={styles.listItem}>
                      <div>
                        <span>
                          账号：<span>{item.account}</span>
                        </span>
                        <span>
                          角色名：<span>{item.roleName}</span>
                        </span>
                        <span>
                          等级：<span>{item.rank}</span>
                        </span>
                        <span>
                          状态：<span>{item.loginStatus}</span>
                        </span>
                      </div>
                    </div>
                  }
                />
              </ListItem>
            )}
          />
        </div>
      ))}

      <AddAccount
        addAccount={addAccount}
        hideModal={hideAddModal}
        visible={addModalVisible}
        refreshData={getGameAccountList}
        accountAndServerGroupList={gameAccountList.map((item) => ({
          groupName: item.groupName,
          serverGroup: item.serverGroup.join(' / '),
          accountsNum: item.accountList.length,
        }))}
      />
    </Form>
  )
}
