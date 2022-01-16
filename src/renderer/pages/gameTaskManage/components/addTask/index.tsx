import { Modal, Form, Input, InputNumber } from 'antd'

const FormItem = Form.Item

interface IAddGameTask {
  visible: boolean
  hideModal: () => void
}
export function AddgGameTask(props: IAddGameTask) {
  const { visible, hideModal } = props

  return (
    <Modal title="添加任务" visible={visible} onCancel={hideModal}>
      <Form>
        <FormItem label="任务名称" rules={[{ required: true, message: '任务名称不能为空' }]}>
          <Input />
        </FormItem>
        <FormItem label="任务个数">
          <InputNumber min={0} />
        </FormItem>
        <FormItem label="活跃度">
          <InputNumber min={0} />
        </FormItem>
      </Form>
    </Modal>
  )
}
