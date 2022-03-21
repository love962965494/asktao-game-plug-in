import {
  Form,
  Modal,
  Input,
  Space,
  Radio,
  Select,
  Button,
  DatePicker,
  TimePicker,
  InputNumber,
  RadioChangeEvent,
} from 'antd'
import moment from 'moment'
import { GameTask } from 'constants/types'
import { useEffect, useState } from 'react'
import { useForm } from 'antd/lib/form/Form'
import { SelectWithAdd } from 'renderer/components'
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons'

const FormItem = Form.Item
const FormList = Form.List
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
  const [showSetTime, setShowSetTime] = useState(tag === '限时任务')
  const [taskLimitType, setTaskLimitType] = useState<number>(record?.taskLimitType || 1)

  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        ...record,
        tag,
      })
      if (tag === '限时任务') {
        form.setFieldsValue({
          taskDate:
            record.taskLimitType === 2
              ? record.taskDate!.map(([startDate, endDate]) => [moment(startDate), moment(endDate)])
              : record.taskDate,
          taskTime: record.taskTime!.map(([startTime, endTime]) => [
            moment(moment().format('YYYY-MM-DD') + ' ' + startTime),
            moment(moment().format('YYYY-MM-DD') + ' ' + endTime),
          ]),
        })
      }
    }
  }, [record, tag])

  const handleFormSubmit = () => {
    form
      .validateFields()
      .then(async (gameTask: GameTask & { tag: string }) => {
        console.log('gameTask: ', gameTask)
        if (gameTask.tag === '限时任务') {
          if (gameTask.taskLimitType === 2) {
            gameTask.taskDate = gameTask.taskDate!.map(([startDate, endDate]) => [
              (startDate as unknown as moment.Moment).format('YYYY-MM-DD'),
              (endDate as unknown as moment.Moment).format('YYYY-MM-DD'),
            ]) as [string, string][]
          }
          gameTask.taskTime = gameTask.taskTime!.map(([startTime, endTime]) => [
            (startTime as unknown as moment.Moment).format('HH:mm:ss'),
            (endTime as unknown as moment.Moment).format('HH:mm:ss'),
          ]) as [string, string][]
        }

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

  const handleTagChange = (tag: string) => {
    if (tag === '限时任务') {
      setShowSetTime(true)
    } else {
      setShowSetTime(false)
    }
  }

  const handleTaskLimitTypeChange = ($ev: RadioChangeEvent) => {
    const { value: taskLimitType } = $ev.target

    form.setFieldsValue({ taskDate: [] })
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
        <FormItem name="taskType" label="任务类型" rules={[{ required: true, message: '任务类型不能为空' }]}>
          <RadioGroup>
            <Radio value="group">组队任务</Radio>
            <Radio value="single">单人任务</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="任务分组" name="tag" rules={[{ required: true, message: '任务分组不能为空' }]}>
          <SelectWithAdd list={tagList} onChange={handleTagChange} />
        </FormItem>
        {showSetTime && [
          <FormItem
            label="限时类型"
            initialValue={1}
            key="taskLimitType"
            name="taskLimitType"
            rules={[{ required: true, message: '限时类型不能为空' }]}
          >
            <RadioGroup onChange={handleTaskLimitTypeChange}>
              <Radio value={1}>日常任务</Radio>
              <Radio value={2}>限时活动</Radio>
            </RadioGroup>
          </FormItem>,
          <FormList name="taskDate" key="taskDate" initialValue={[[]]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <FormItem
                    label={index === 0 ? ' 任务日期' : ''}
                    wrapperCol={{ offset: index !== 0 ? 4 : 0 }}
                    required
                    key={field.key}
                  >
                    <Space>
                      <FormItem
                        noStyle
                        name={[field.name, 0]}
                        rules={[{ required: true, message: '开始日期不能为空' }]}
                      >
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
                      <span>-</span>
                      <FormItem
                        noStyle
                        name={[field.name, 1]}
                        rules={[{ required: true, message: '结束日期不能为空' }]}
                      >
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
                      {index === 0 && (
                        <a href="#" onClick={() => add()}>
                          <PlusCircleOutlined />
                        </a>
                      )}
                      {fields.length > 1 && (
                        <a href="#" onClick={() => remove(index)}>
                          <MinusCircleOutlined />
                        </a>
                      )}
                    </Space>
                  </FormItem>
                ))}
              </>
            )}
          </FormList>,
          <FormList name="taskTime" key="taskTime" initialValue={[[]]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <FormItem
                    required
                    key={field.key}
                    label={index === 0 ? ' 任务时间' : ''}
                    wrapperCol={{ offset: index !== 0 ? 4 : 0 }}
                  >
                    <Space>
                      <FormItem
                        noStyle
                        name={[field.name, 0]}
                        rules={[{ required: true, message: '开始时间不能为空' }]}
                      >
                        <TimePicker style={{ width: 150 }} placeholder="开始时间" />
                      </FormItem>
                      <span>-</span>
                      <FormItem
                        noStyle
                        name={[field.name, 1]}
                        rules={[{ required: true, message: '结束时间不能为空' }]}
                      >
                        <TimePicker style={{ width: 150 }} placeholder="结束时间" />
                      </FormItem>
                      {index === 0 && (
                        <a href="#" onClick={() => add()}>
                          <PlusCircleOutlined />
                        </a>
                      )}
                      {fields.length > 1 && (
                        <a href="#" onClick={() => remove(index)}>
                          <MinusCircleOutlined />
                        </a>
                      )}
                    </Space>
                  </FormItem>
                ))}
              </>
            )}
          </FormList>,
        ]}
      </Form>
    </Modal>
  )
}
