import { Form, Input, Modal } from 'antd'

const FormItem = Form.Item

export function AddAccount() {
  return (
    <Modal title="添加账号" visible={true}>
      <Form labelCol={{ span: 4 }}>
        <FormItem label="账户号" name="account" rules={[{ required: true, message: '账户号必填' }]}>
          <Input />
        </FormItem>
        <FormItem label="密码" name="password" rules={[{ required: true, message: '密码必填' }]}>
          <Input />
        </FormItem>
        <FormItem label="区组" name="">
          <div>区组</div>
        </FormItem>
      </Form>
    </Modal>
  )
}
