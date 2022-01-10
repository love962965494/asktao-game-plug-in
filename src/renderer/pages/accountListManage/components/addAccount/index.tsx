import { Form, Input, Modal } from 'antd'
import { GameAccount } from 'constants/types'
import { useState } from 'react'
import { GameServerGroup } from '../gameServerGroup'

const FormItem = Form.Item

interface IAddAccount {
  visible: boolean
  hideModal: () => void
  addAccount: (account: GameAccount) => Promise<void>
}

export function AddAccount(props: IAddAccount) {
  const { visible, hideModal, addAccount } = props
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleFormSubmit = () => {
    form.validateFields().then(async (account) => {
      console.log('account: ', account)
      try {
        setLoading(true)
        await addAccount(account)
        form.resetFields()
      } catch (error) {
        console.log('addAccount error: ', error)
      } finally {
        setLoading(false)
      }
    }).catch(err => {
      console.log('errors: ', err)
    })
  }

  const handleFormReset = () => {
    form.resetFields()
    hideModal()
  }

  return (
    <Modal
      title="添加账号"
      visible={visible}
      onOk={handleFormSubmit}
      onCancel={handleFormReset}
      confirmLoading={loading}
    >
      <Form labelCol={{ span: 4 }} form={form}>
        <FormItem label="账户号" name="account" rules={[{ required: true, message: '账户号必填' }]}>
          <Input />
        </FormItem>
        <FormItem label="密码" name="password" rules={[{ required: true, message: '密码必填' }]}>
          <Input />
        </FormItem>
        <FormItem label="区组" name="serverGroup" rules={[{ required: true, message: '区组必填' }]}>
          <GameServerGroup />
        </FormItem>
      </Form>
    </Modal>
  )
}
