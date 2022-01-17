import { Modal, Form, Input, InputNumber, Button } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { SelectWithAdd } from 'renderer/components'

const FormItem = Form.Item

interface IAddGameTask {
  visible: boolean
  hideModal: () => void
}
export function AddGameTask(props: IAddGameTask) {
  const { visible, hideModal } = props
  const [form] = useForm()

  const handleBtnClick = () => {
    console.log('values: ', form.getFieldsValue())
  }

  return (
    <Modal title="添加任务" visible={visible} onCancel={hideModal}>
      <Form form={form} labelCol={{ span: 4 }}>
        <FormItem name="name" label="任务名称" rules={[{ required: true, message: '任务名称不能为空' }]}>
          <Input />
        </FormItem>
        <FormItem name="count" label="任务个数">
          <InputNumber min={0} />
        </FormItem>
        <FormItem name="liveness" label="活跃度">
          <InputNumber min={0} />
        </FormItem>
        <FormItem label="任务类型" name="tag">
          <SelectWithAdd list={[]} />
        </FormItem>
        <FormItem label="测试">
          <Button type="primary" onClick={handleBtnClick}>测试</Button>
        </FormItem>
      </Form>
    </Modal>
  )
}
