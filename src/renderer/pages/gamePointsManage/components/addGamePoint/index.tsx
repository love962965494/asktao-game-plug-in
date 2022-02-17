import { Form, Input, Modal, Space, InputNumber } from 'antd'
import { KeyboardEventHandler, useEffect, useRef } from 'react'
import { GamePoint, Point } from 'constants/types'
import { SelectWithAdd } from 'renderer/components'

const { useForm, Item: FormItem } = Form
const InputGroup = Input.Group

export interface IAddGamePoint {
  tag?: string
  visible: boolean
  tagList: string[]
  record?: GamePoint
  hideModal: () => void
  refreshData: () => void
  addGamePoint?: (gamePoint: GamePoint) => Promise<void>
  editGamePoint?: (gamePoint: GamePoint) => Promise<void>
}

export function AddGamePoint(props: IAddGamePoint) {
  const [form] = useForm()
  const { tag, record, visible, tagList, hideModal, addGamePoint, editGamePoint, refreshData } = props
  const shortcutRef = useRef<string[]>([])

  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        name: record.name,
        point: {
          ...record.point,
        },
        shortcut: record.shortcut,
        tag,
      })
    }
  }, [record])

  useEffect(() => {
    const interval = setInterval(() => {
      if (shortcutRef.current.length > 0) {
        const sortKeys = [...shortcutRef.current]
        sortKeys.sort((a, b) => {
          let num1 = a === 'Control' ? 10000 : a === 'Shift' ? 1000 : a === 'Alt' ? 100 : 1
          let num2 = b === 'Control' ? 10000 : b === 'Shift' ? 1000 : b === 'Alt' ? 100 : 1

          return num2 - num1
        })

        form.setFieldsValue({
          shortcut: sortKeys.join('+') === 'Backspace' ? '' : sortKeys.join('+'),
        })
      }

      shortcutRef.current = []
    }, 1000)
    return () => {
      clearInterval(interval)
    }
  }, [])

  const handleShortcutKeyUp: KeyboardEventHandler<HTMLInputElement> = (event) => {
    let { key, code } = event

    if (code.includes('Digit')) {
      key = code.replace('Digit', '')
    }

    if (code.includes('Key')) {
      key = code.replace('Key', '')
    }

    shortcutRef.current = [...shortcutRef.current, key]
  }

  const handleFormSubmit = () => {
    form
      .validateFields()
      .then(async (gamePoint: GamePoint & { point: Point }) => {
        if (record) {
          await editGamePoint?.({ ...gamePoint, id: record.id, point: gamePoint.point })
        } else {
          await addGamePoint?.({ ...gamePoint, point: gamePoint.point })
        }
        form.resetFields()
        hideModal()
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
      visible={visible}
      onOk={handleFormSubmit}
      onCancel={handleHideModal}
      title={record ? '修改坐标' : '添加坐标'}
    >
      <Form form={form} labelCol={{ span: 4 }}>
        <FormItem label="坐标名称" name="name" rules={[{ required: true, message: '坐标名称不能为空' }]}>
          <Input />
        </FormItem>
        <FormItem label="坐标位置" name="point" rules={[{ required: true }]}>
          <InputGroup>
            <Space>
              <FormItem name={['point', 'x']} noStyle rules={[{ required: true, message: '坐标X位置不能为空' }]}>
                <InputNumber placeholder="x坐标" min={0} />
              </FormItem>
              <FormItem name={['point', 'y']} noStyle rules={[{ required: true, message: '坐标Y位置不能为空' }]}>
                <InputNumber placeholder="y坐标" min={0} />
              </FormItem>
            </Space>
          </InputGroup>
        </FormItem>
        <FormItem label="对应快捷键" name="shortcut">
          <Input onKeyUp={handleShortcutKeyUp} readOnly placeholder="点击聚焦后按快捷键即可" />
        </FormItem>
        <FormItem label="坐标标签" name="tag" rules={[{ required: true, message: '坐标标签不能为空' }]}>
          <SelectWithAdd list={tagList} />
        </FormItem>
      </Form>
    </Modal>
  )
}
