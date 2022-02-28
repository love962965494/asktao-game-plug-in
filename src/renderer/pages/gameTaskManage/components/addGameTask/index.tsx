import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Space,
  Radio,
  RadioChangeEvent,
  Select,
  DatePicker,
  TimePicker,
} from 'antd'
import { RuleObject } from 'antd/lib/form'
import { useForm } from 'antd/lib/form/Form'
import { GameTask } from 'constants/types'
import { useEffect, useState } from 'react'
import { SelectWithAdd } from 'renderer/components'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const SelectOption = Select.Option

const weekdays = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']

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
  const [showSetTime, setShowSetTime] = useState(false)
  const [taskLimitType, setTaskLimitType] = useState<number>()

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
        console.log('gameTask: ', gameTask)
        // if (record) {
        //   await editGameTask?.({ ...gameTask, id: record.id })
        // } else {
        //   await addGameTask?.(gameTask)
        // }
        // handleHideModal()
        // refreshData()
      })
      .catch((error) => {
        console.log('handleFormSubmit error: ', error)
      })
  }

  const handleHideModal = () => {
    form.resetFields()
    hideModal()
  }

  const handleTagChange = (tag: string) => {
    if (tag === '限时任务') {
      setShowSetTime(true)
    } else {
      setShowSetTime(false)
    }
  }

  const handleTaskLimitTypeChange = ($ev: RadioChangeEvent) => {
    const { value: taskLimitType } = $ev.target

    setTaskLimitType(taskLimitType)
  }

  return (
    <Modal
      title={record ? '修改任务' : '添加任务'}
      visible={visible}
      footer={
        <Space>
          <Button onClick={handleHideModal}>取消</Button>
          <Button type="primary" onClick={handleFormSubmit}>
            确定
          </Button>
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
        <FormItem label="任务分组" name="tag">
          <SelectWithAdd list={tagList} onChange={handleTagChange} />
        </FormItem>
        {showSetTime && [
          <FormItem
            label="限时类型"
            key="taskLimitType"
            name="taskLimitType"
            rules={[{ required: true, message: '限时类型不能为空' }]}
          >
            <RadioGroup onChange={handleTaskLimitTypeChange}>
              <Radio value={1}>日常任务</Radio>
              <Radio value={2}>限时活动</Radio>
            </RadioGroup>
          </FormItem>,
          <FormItem label="任务日期" key="taskDate" required>
            <FormItem noStyle name={['taskDate', 0]} rules={[{ required: true, message: '开始日期不能为空' }]}>
              {taskLimitType === 1 ? (
                <Select style={{ width: 150 }} placeholder="开始日期">
                  {weekdays.map((day) => (
                    <SelectOption key={day}>{day}</SelectOption>
                  ))}
                </Select>
              ) : (
                <DatePicker placeholder="开始日期" />
              )}
            </FormItem>
            <span style={{ margin: '0 10px' }}>-</span>
            <FormItem noStyle name={['taskDate', 1]} rules={[{ required: true, message: '结束日期不能为空' }]}>
              {taskLimitType === 1 ? (
                <Select style={{ width: 150 }} placeholder="结束日期">
                  {weekdays.map((day) => (
                    <SelectOption key={day}>{day}</SelectOption>
                  ))}
                </Select>
              ) : (
                <DatePicker placeholder="结束日期" />
              )}
            </FormItem>
          </FormItem>,
          <FormItem label="任务时间" key="taskTime" required>
            <FormItem noStyle name={['taskTime', 0]} rules={[{ required: true, message: '开始时间不能为空' }]}>
              <TimePicker style={{ width: 150 }} placeholder="开始时间" />
            </FormItem>
            <span style={{ margin: '0 10px' }}>-</span>
            <FormItem noStyle name={['taskTime', 1]} rules={[{ required: true, message: '结束时间不能为空' }]}>
              <TimePicker style={{ width: 150 }} placeholder="结束时间" />
            </FormItem>
          </FormItem>,
        ]}
      </Form>
    </Modal>
  )
}
