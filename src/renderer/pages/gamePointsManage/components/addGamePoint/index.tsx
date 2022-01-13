import { Form, Input, Modal, Space, InputNumber } from 'antd'
import { KeyboardEventHandler, useEffect, useRef, useState } from 'react'

const { useForm, Item: FormItem } = Form
const InputGroup = Input.Group

interface IAddGamePoint {
  visible: boolean
  hideModal: () => void
}

export function AddGamePoint(props: IAddGamePoint) {
  const { visible } = props
  const shortcutRef = useRef<string[]>([])
  const [form] = useForm()

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

    shortcutRef.current = [...shortcutRef.current, key]
  }

  return (
    <Modal title="添加坐标" visible={visible}>
      <Form labelCol={{ span: 4 }} form={form}>
        <FormItem label="坐标名称" name="name" rules={[{ required: true, message: '坐标名称不能为空' }]}>
          <Input />
        </FormItem>
        <FormItem label="坐标位置" name="point" rules={[{ required: true, message: '坐标位置不能为空' }]}>
          <InputGroup>
            <Space>
              <InputNumber placeholder="x坐标" min={0} />
              <InputNumber placeholder="y坐标" min={0} />
            </Space>
          </InputGroup>
        </FormItem>
        <FormItem label="快捷键" name="shortcut">
          <Input onKeyUp={handleShortcutKeyUp} readOnly placeholder="点击聚焦后按快捷键即可" />
        </FormItem>
      </Form>
    </Modal>
  )
}
