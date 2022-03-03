import { Form, InputNumber, Modal } from 'antd'
import { GameAccount } from 'constants/types'
import { useEffect } from 'react'

const FormItem = Form.Item

export type IRecord = GameAccount['roleList'][0] & {
  groupName: string
  account: string
}
interface IBattlePlan {
  record: IRecord
  visibel: boolean
  hideModal: () => void
  refreshData: () => void
  changeRoleBattlePlan: (record: IRecord) => Promise<void>
}

const arr = Array.from({ length: 20 }, (_, index) => index + 1)
export function BattlePlan(props: IBattlePlan) {
  const { visibel, record, hideModal, refreshData, changeRoleBattlePlan } = props
  const [form] = Form.useForm()

  useEffect(() => {
    form.setFieldsValue({ battlePlan: record.battlePlan })
  }, [record])

  const handleFormSubmit = () => {
    form
      .validateFields()
      .then(async ({ battlePlan }: { battlePlan: number[] }) => {
        await changeRoleBattlePlan({ ...record, battlePlan })
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
    <Modal title="修改战斗方案" visible={visibel} onCancel={handleHideModal} onOk={handleFormSubmit}>
      <Form form={form} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }} labelCol={{ span: 10 }}>
        {arr.map((item, index) => (
          <FormItem
            label={`第${item}回合`}
            key={item}
            name={['battlePlan', index]}
            rules={[{ required: true, message: '回合策略不能为空' }]}
          >
            <InputNumber min={1} max={3} />
          </FormItem>
        ))}
        <FormItem
          label="超过20回合后"
          name={['battlePlan', 20]}
          rules={[{ required: true, message: '回合策略不能为空' }]}
        >
          <InputNumber min={1} max={3} />
        </FormItem>
      </Form>
    </Modal>
  )
}
