import { Form, Input, Modal, Select, Space } from 'antd'
import { PlusOutlined, CloseOutlined } from '@ant-design/icons'
import { GameAccount } from 'constants/types'
import { useEffect, useReducer } from 'react'
import { GameServerGroup } from '../gameServerGroup'
import { RuleObject } from 'antd/lib/form'
import { simpleCloneKeep } from 'utils/toolkits'
import styles from './addAccount.module.scss'

const FormItem = Form.Item
const SelectOption = Select.Option

type IAccountAndServerGroup = { groupName: string; serverGroup: string; accountsNum: number }
interface IAddAccount {
  visible: boolean
  hideModal: () => void
  refreshData: () => void
  accountAndServerGroupList: IAccountAndServerGroup[]
  addAccount: (account: GameAccount) => Promise<void>
}

interface IState {
  hasAddedGroupName: boolean
  addGroupNameVisible: boolean
  trueAccountAndServerGroupList: IAccountAndServerGroup[]
}

type IActionTypes = 'SET_HAS_ADDED_GROUP_NAME' | 'SET_ADD_GROUP_NAME_VISIBLE' | 'SET_TRUE_ACCOUNT_AND_SERVER_GROUP_LIST'

function reducer(state: IState, action: { type: IActionTypes; payload: Partial<IState> }) {
  switch (action.type) {
    case 'SET_HAS_ADDED_GROUP_NAME':
    case 'SET_ADD_GROUP_NAME_VISIBLE':
    case 'SET_TRUE_ACCOUNT_AND_SERVER_GROUP_LIST':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

const initialState: IState = {
  hasAddedGroupName: false,
  addGroupNameVisible: false,
  trueAccountAndServerGroupList: [],
}

export function AddAccount(props: IAddAccount) {
  const { visible, hideModal, addAccount, accountAndServerGroupList, refreshData } = props
  const [addAccountForm] = Form.useForm()
  const [addGroupNameForm] = Form.useForm()
  const [state, dispatch] = useReducer(reducer, initialState)
  const { addGroupNameVisible, hasAddedGroupName, trueAccountAndServerGroupList } = state

  useEffect(() => {
    dispatch({
      type: 'SET_TRUE_ACCOUNT_AND_SERVER_GROUP_LIST',
      payload: { trueAccountAndServerGroupList: simpleCloneKeep(accountAndServerGroupList) },
    })
  }, [accountAndServerGroupList])

  const validateGroupName = (_: RuleObject, value: string) => {
    if (accountAndServerGroupList.find(({ groupName }) => groupName === value)) {
      return Promise.reject(new Error('?????????????????????'))
    }

    return Promise.resolve(value)
  }

  const showAddGroupModal = () =>
    dispatch({ type: 'SET_ADD_GROUP_NAME_VISIBLE', payload: { addGroupNameVisible: true } })

  const hideAddGroupModal = () => {
    addGroupNameForm.resetFields()
    dispatch({ type: 'SET_ADD_GROUP_NAME_VISIBLE', payload: { addGroupNameVisible: false } })
  }

  const handleAddAccountFormSubmit = () => {
    addAccountForm
      .validateFields()
      .then(async (account: GameAccount & { groupName: string; serverGroup: string }) => {
        try {
          await addAccount({ ...account })
          addAccountForm.resetFields()
          hideModal()
          refreshData()
          dispatch({ type: 'SET_HAS_ADDED_GROUP_NAME', payload: { hasAddedGroupName: false } })
        } catch (error) {
          console.log('addAccount error: ', error)
        }
      })
      .catch((err) => {
        console.log('handleAddAccountFormSubmit error: ', err)
      })
  }

  const handleAddAccountFormReset = () => {
    addAccountForm.resetFields()
    hideModal()
  }

  const handleGroupNameChange = (value: string) => {
    if (value === 'add') {
      showAddGroupModal()
      setTimeout(() => {
        addAccountForm.setFieldsValue({
          groupName: undefined,
          serverGroup: undefined,
        })
      }, 0)
    } else {
      addAccountForm.setFieldsValue({
        serverGroup: trueAccountAndServerGroupList.find(({ groupName }) => groupName === value)?.serverGroup,
      })
    }
  }

  const handleAddGroupNameFormSubmit = () => {
    addGroupNameForm
      .validateFields()
      .then(({ groupName, serverGroup }) => {
        dispatch({ type: 'SET_HAS_ADDED_GROUP_NAME', payload: { hasAddedGroupName: true } })
        dispatch({
          type: 'SET_TRUE_ACCOUNT_AND_SERVER_GROUP_LIST',
          payload: {
            trueAccountAndServerGroupList: [
              ...trueAccountAndServerGroupList,
              { groupName, serverGroup, accountsNum: 0 },
            ],
          },
        })
        hideAddGroupModal()
        addAccountForm.setFieldsValue({
          groupName,
          serverGroup,
        })
      })
      .catch((err) => {
        console.log('handleAddGroupNameFormSubmit error: ', err)
      })
  }

  const handleAddGroupNameFormReset = () => {
    addGroupNameForm.resetFields()
    hideAddGroupModal()
  }

  const handleDeleteGroupNameClick = (groupName: string) => {
    const { groupName: nowGroupName, serverGroup } = addAccountForm.getFieldsValue(['groupName', 'serverGroup'])

    setTimeout(() => {
      addAccountForm.setFieldsValue({
        groupName: nowGroupName && nowGroupName !== groupName ? nowGroupName : undefined,
        serverGroup: nowGroupName && nowGroupName !== groupName ? serverGroup : undefined,
      })
    }, 0)

    dispatch({ type: 'SET_HAS_ADDED_GROUP_NAME', payload: { hasAddedGroupName: false } })
    dispatch({
      type: 'SET_TRUE_ACCOUNT_AND_SERVER_GROUP_LIST',
      payload: { trueAccountAndServerGroupList: trueAccountAndServerGroupList.slice(0, -1) },
    })
  }

  return (
    <>
      <Modal
        title="????????????"
        key="addAccount"
        visible={visible}
        onOk={handleAddAccountFormSubmit}
        onCancel={handleAddAccountFormReset}
      >
        <Form labelCol={{ span: 4 }} form={addAccountForm}>
          <FormItem label="?????????" name="account" rules={[{ required: true, message: '???????????????' }]}>
            <Input />
          </FormItem>
          <FormItem label="??????" name="password" rules={[{ required: true, message: '????????????' }]}>
            <Input />
          </FormItem>
          <FormItem label="????????????" name="groupName" rules={[{ required: true, message: '??????????????????' }]}>
            <Select onSelect={handleGroupNameChange} optionLabelProp="value">
              {trueAccountAndServerGroupList.map(({ groupName, accountsNum }, index) => (
                <SelectOption key={groupName} disabled={accountsNum === 5} className={styles.groupName}>
                  <span className="left">{groupName}</span>
                  <span className="right">{accountsNum}</span>
                  {hasAddedGroupName && index === trueAccountAndServerGroupList.length - 1 && (
                    <CloseOutlined
                      className={styles.close + ' red'}
                      onClick={handleDeleteGroupNameClick.bind(null, groupName)}
                    />
                  )}
                </SelectOption>
              ))}
              {!hasAddedGroupName && (
                <SelectOption key="add" className={styles.groupName + ' red'}>
                  <Space>
                    <PlusOutlined />
                    ????????????
                  </Space>
                </SelectOption>
              )}
            </Select>
          </FormItem>
          <FormItem label="??????" name="serverGroup" rules={[{ required: true, message: '????????????' }]}>
            <Input readOnly />
          </FormItem>
        </Form>
      </Modal>

      <Modal
        key="addGroupNmae"
        title="????????????"
        visible={addGroupNameVisible}
        onOk={handleAddGroupNameFormSubmit}
        onCancel={handleAddGroupNameFormReset}
      >
        <Form form={addGroupNameForm} labelCol={{ span: 4 }}>
          <FormItem
            label="?????????"
            name="groupName"
            rules={[{ validator: validateGroupName }, { required: true, message: '?????????????????????' }]}
          >
            <Input />
          </FormItem>
          <FormItem label="??????" name="serverGroup" rules={[{ required: true, message: '????????????' }]}>
            <GameServerGroup />
          </FormItem>
        </Form>
      </Modal>
    </>
  )
}
