import { Form, Input, Modal, Select } from 'antd'
import { PlusOutlined, CloseOutlined } from '@ant-design/icons'
import { GameAccount } from 'constants/types'
import { useEffect, useReducer } from 'react'
import { GameServerGroup } from '../gameServerGroup'
import { RuleObject } from 'antd/lib/form'
import { simpleCloneKeep } from 'utils/toolkits'
import styles from './addAccount.module.scss'

const FormItem = Form.Item
const SelectOption = Select.Option

interface IAddAccount {
  visible: boolean
  hideModal: () => void
  addAccount: (account: GameAccount) => Promise<void>
  groupNameList: [string, number][]
  refreshData: () => void
}

interface IState {
  loading: boolean
  hasAddedGroupName: boolean
  addGroupNameVisible: boolean
  trueGroupNameList: [string, number][]
}

type IActionTypes =
  | 'SET_LOADING'
  | 'SET_HAS_ADDED_GROUP_NAME'
  | 'SET_ADD_GROUP_NAME_VISIBLE'
  | 'SET_TRUE_GROUP_NAME_LIST'

function reducer(state: IState, action: { type: IActionTypes; payload: Partial<IState> }) {
  switch (action.type) {
    case 'SET_LOADING':
    case 'SET_HAS_ADDED_GROUP_NAME':
    case 'SET_ADD_GROUP_NAME_VISIBLE':
    case 'SET_TRUE_GROUP_NAME_LIST':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

const initialState: IState = {
  loading: false,
  addGroupNameVisible: false,
  hasAddedGroupName: false,
  trueGroupNameList: [],
}

export function AddAccount(props: IAddAccount) {
  const { visible, hideModal, addAccount, groupNameList, refreshData } = props
  const [addAccountForm] = Form.useForm()
  const [addGroupNameForm] = Form.useForm()
  const [state, dispatch] = useReducer(reducer, initialState)
  const { loading, addGroupNameVisible, hasAddedGroupName, trueGroupNameList } = state

  useEffect(() => {
    dispatch({
      type: 'SET_TRUE_GROUP_NAME_LIST',
      payload: { trueGroupNameList: simpleCloneKeep(groupNameList) },
    })
  }, [groupNameList])

  const validateGroupName = (_: RuleObject, value: string) => {
    if (groupNameList.find(([groupName]) => groupName === value)) {
      return Promise.reject(new Error('分组名已经存在'))
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
      .then(async (account: GameAccount) => {
        console.log('account: ', account)
        try {
          dispatch({ type: 'SET_LOADING', payload: { loading: true } })
          await addAccount({ ...account, serverGroup: (account.serverGroup as unknown as string).split('/') })
          addAccountForm.resetFields()
          hideModal()
          refreshData()
        } catch (error) {
          console.log('addAccount error: ', error)
        } finally {
          dispatch({ type: 'SET_LOADING', payload: { loading: false } })
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
      addAccountForm.setFieldsValue({
        groupName: {
          value: undefined,
        },
      })
    }
  }

  const handleAddGroupNameFormSubmit = () => {
    addGroupNameForm
      .validateFields()
      .then(({ groupName }) => {
        dispatch({ type: 'SET_HAS_ADDED_GROUP_NAME', payload: { hasAddedGroupName: true } })
        dispatch({
          type: 'SET_TRUE_GROUP_NAME_LIST',
          payload: { trueGroupNameList: [...trueGroupNameList, [groupName, 0]] },
        })
        addGroupNameForm.resetFields()
        hideAddGroupModal()
      })
      .catch((err) => {
        console.log('handleAddGroupNameFormSubmit error: ', err)
      })
  }

  const handleAddGroupNameFormReset = () => {
    addGroupNameForm.resetFields()
    hideAddGroupModal()
  }

  const handleDeleteGroupNameClick = () => {
    addAccountForm.setFieldsValue({
      groupName: {
        value: undefined,
      },
    })
    dispatch({ type: 'SET_HAS_ADDED_GROUP_NAME', payload: { hasAddedGroupName: false } })
    dispatch({ type: 'SET_TRUE_GROUP_NAME_LIST', payload: { trueGroupNameList: trueGroupNameList.slice(0, -1) } })
  }

  return (
    <>
      <Modal
        title="添加账号"
        key="addAccount"
        visible={visible}
        confirmLoading={loading}
        onOk={handleAddAccountFormSubmit}
        onCancel={handleAddAccountFormReset}
      >
        <Form labelCol={{ span: 4 }} form={addAccountForm}>
          <FormItem label="账户号" name="account" rules={[{ required: true, message: '账户号必填' }]}>
            <Input />
          </FormItem>
          <FormItem label="密码" name="password" rules={[{ required: true, message: '密码必填' }]}>
            <Input />
          </FormItem>
          <FormItem label="区组" name="serverGroup" rules={[{ required: true, message: '区组必填' }]}>
            <GameServerGroup />
          </FormItem>
          <FormItem label="账号分组" name="groupName" rules={[{ required: true, message: '账号分组必填' }]}>
            <Select onSelect={handleGroupNameChange} optionLabelProp="value">
              {trueGroupNameList.map(([groupName, accountsNum], index) => (
                <SelectOption key={groupName} disabled={accountsNum === 5} className={styles.groupName}>
                  <span className={styles.left}>{groupName}</span>
                  <span className={styles.right}>{accountsNum}</span>
                  {hasAddedGroupName && index === trueGroupNameList.length - 1 && (
                    <CloseOutlined className={styles.close + ' ' + styles.red} onClick={handleDeleteGroupNameClick} />
                  )}
                </SelectOption>
              ))}
              {!hasAddedGroupName && (
                <SelectOption key="add" className={styles.groupName + ' ' + styles.red}>
                  <PlusOutlined style={{ marginRight: '15px' }} />
                  添加分组
                </SelectOption>
              )}
            </Select>
          </FormItem>
        </Form>
      </Modal>
      <Modal
        key="addGroupNmae"
        title="添加分组"
        visible={addGroupNameVisible}
        onOk={handleAddGroupNameFormSubmit}
        onCancel={handleAddGroupNameFormReset}
      >
        <Form form={addGroupNameForm}>
          <FormItem
            label="分组名"
            name="groupName"
            rules={[{ validator: validateGroupName }, { required: true, message: '分组名不能为空' }]}
          >
            <Input />
          </FormItem>
        </Form>
      </Modal>
      ,
    </>
  )
}
