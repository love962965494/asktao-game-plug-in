import { Modal, Form, Input, InputNumber, Button, Space } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { GameTask } from 'constants/types'
import { useEffect } from 'react'
import { SelectWithAdd } from 'renderer/components'

const FormItem = Form.Item

export interface IAddGameTask {
  tag?: string
  visible: boolean
  record?: GameTask
  tagList: string[]
  hideModal: () => void
  refreshData: () => void
  addGameTask?: (gameTask: GameTask) => Promise<void>
  editGameTask?: (gameTask: GameTask) => Promise<void>
}
export function AddGameTask(props: IAddGameTask) {
  const { tag, visible, hideModal, tagList, record, refreshData, addGameTask, editGameTask } = props
  const [form] = useForm()

  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        ...record,
        tag,
      })
    }
  }, [record])

  const handleFormSubmit = () => {
    form
      .validateFields()
      .then(async (gameTask: GameTask) => {
        if (record) {
          await editGameTask?.({ ...gameTask, id: record.id })
        } else {
          await addGameTask?.(gameTask)
        }
        handleHideModal()
        refreshData()
      })
      .catch((error) => {
        console.log('handleFormSubmit error: ', error)
      })
  }

  const handleHideModal = () => {
    form.resetFields()
    hideModal()
  }

  return (
    <Modal
      title={record ? '修改任务' : '添加任务'}
      visible={visible}
      footer={
        <Space>
          <Button onClick={handleHideModal}>取消</Button>
          <Button type="primary" onClick={handleFormSubmit}>确定</Button>
        </Space>
      }
    >
      <Form form={form} labelCol={{ span: 4 }}>
        <FormItem name="taskName" label="任务名称" rules={[{ required: true, message: '任务名称不能为空' }]}>
          <Input />
        </FormItem>
        <FormItem name="taskCount" label="任务个数">
          <InputNumber min={0} />
        </FormItem>
        {/* <FormItem name="liveness" label="活跃度">
          <InputNumber min={0} />
        </FormItem> */}
        <FormItem label="任务分组" name="tag">
          <SelectWithAdd list={tagList} />
        </FormItem>
      </Form>
    </Modal>
  )
}
