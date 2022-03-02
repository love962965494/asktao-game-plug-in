import { Form, InputNumber, Modal } from 'antd'
import { GameAccount } from 'constants/types'
import { useEffect } from 'react'

const FormItem = Form.Item
interface IBattlePlan {
  visibel: boolean
  groupName: string
  hideModal: () => void
  record: GameAccount['roleList'][0]
}

const arr = new Array(20).map((_, index) => index + 1)
export function BattlePlan(props: IBattlePlan) {
  const { visibel, record, groupName } = props
  const [form] = Form.useForm()

  useEffect(() => {
    form.setFieldsValue({ battlePlan: record.battlePlan })
  }, [record])

  return (
    <Modal title="修改战斗方案" visible={visibel}>
      <Form form={form}>
        {arr.map((item, index) => (
          <FormItem label={`第${item}回合`} key={item} name={['battlePlan', index]}>
            <InputNumber min={1} max={3} />
          </FormItem>
        ))}
        <FormItem label="超过20回合后" name={['battlePlan', 20]}>
          <InputNumber min={1} max={3} />
        </FormItem>
      </Form>
    </Modal>
  )
}
