import { Form, Input } from 'antd'

const FormItem = Form.Item

export default function AddAccount() {
  return (
    <Form>
      <FormItem label="账户号" name="account" rules={[{ required: true, message: '账户号必填' }]}>
        <Input />
      </FormItem>
      <FormItem label="密码" name="password" rules={[{ required: true, message: '密码必填' }]}>
        <Input />
      </FormItem>
      <FormItem label="区组" name=""></FormItem>
    </Form>
  )
}
