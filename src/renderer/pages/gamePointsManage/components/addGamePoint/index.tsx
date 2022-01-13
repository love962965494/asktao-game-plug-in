import { Form, Input, Modal, Space, InputNumber, Select } from 'antd'
import { CloseOutlined, PlusOutlined } from '@ant-design/icons'
import { KeyboardEventHandler, useEffect, useReducer, useRef } from 'react'
import { simpleCloneKeep } from 'utils/toolkits'
import { RuleObject } from 'antd/lib/form'

const { useForm, Item: FormItem } = Form
const InputGroup = Input.Group
const SelectOption = Select.Option

interface IAddGamePoint {
  visible: boolean
  tagList: string[]
  hideModal: () => void
}

interface IState {
  hasAddedTagName: boolean
  trueTagNameList: string[]
  addTagNameModalVisible: boolean
}

type IActionTypes = 'SET_HAS_ADDED_TAG_NAME' | 'SET_TRUE_TAG_NAME_LIST' | 'SET_ADD_TAG_NAME_MODAL_VISIBLE'

function reducer(state: IState, action: { type: IActionTypes; payload: Partial<IState> }) {
  switch (action.type) {
    case 'SET_HAS_ADDED_TAG_NAME':
    case 'SET_TRUE_TAG_NAME_LIST':
    case 'SET_ADD_TAG_NAME_MODAL_VISIBLE':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

const initialState: IState = {
  trueTagNameList: [],
  hasAddedTagName: false,
  addTagNameModalVisible: false,
}

export function AddGamePoint(props: IAddGamePoint) {
  const [addPointForm] = useForm()
  const [addTagForm] = useForm()
  const { visible, tagList, hideModal } = props
  const shortcutRef = useRef<string[]>([])
  const [state, dispatch] = useReducer(reducer, initialState)
  const { hasAddedTagName, trueTagNameList, addTagNameModalVisible } = state

  useEffect(() => {
    dispatch({
      type: 'SET_TRUE_TAG_NAME_LIST',
      payload: { trueTagNameList: simpleCloneKeep(tagList) },
    })
  }, [tagList])

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

  const showAddTagModal = () =>
    dispatch({ type: 'SET_ADD_TAG_NAME_MODAL_VISIBLE', payload: { addTagNameModalVisible: true } })
  const hideAddTagModal = () =>
    dispatch({ type: 'SET_ADD_TAG_NAME_MODAL_VISIBLE', payload: { addTagNameModalVisible: false } })

  const validateTagName = (_: RuleObject, value: string) => {
    if (tagList.find((tag) => tag === value)) {
      return Promise.reject(new Error('标签名称已经存在'))
    }

    return Promise.resolve(value)
  }

  const handleTagChange = (value: string) => {
    if (value === 'add') {
      showAddTagModal()
      addPointForm.setFieldsValue({
        tag: { value: undefined },
      })
    }
  }

  const handleAddTagFormSubmit = () => {
    addTagForm
      .validateFields()
      .then(({ tag }) => {
        dispatch({ type: 'SET_HAS_ADDED_TAG_NAME', payload: { hasAddedTagName: true } })
        dispatch({ type: 'SET_TRUE_TAG_NAME_LIST', payload: { trueTagNameList: [...trueTagNameList, tag] } })
        addTagForm.resetFields()
        hideAddTagModal()
      })
      .catch((error) => {
        console.log('handleAddTagFormSubmit error: ', error)
      })
  }

  return (
    <>
      <Modal title="添加坐标" visible={visible} onCancel={hideModal}>
        <Form labelCol={{ span: 4 }} form={addPointForm}>
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
          <FormItem label="对应快捷键" name="shortcut">
            <Input onKeyUp={handleShortcutKeyUp} readOnly placeholder="点击聚焦后按快捷键即可" />
          </FormItem>
          <FormItem label="坐标标签" name="tag" rules={[{ required: true, message: '坐标标签不能为空' }]}>
            <Select onSelect={handleTagChange}>
              {trueTagNameList.map((tag, index) => (
                <SelectOption key={tag}>
                  <span>{tag}</span>
                  {hasAddedTagName && index === trueTagNameList.length - 1 && <CloseOutlined />}
                </SelectOption>
              ))}
              {!hasAddedTagName && (
                <SelectOption key="add">
                  <Space>
                    <PlusOutlined />
                    添加分组
                  </Space>
                </SelectOption>
              )}
            </Select>
          </FormItem>
        </Form>
      </Modal>

      <Modal visible={addTagNameModalVisible} title="添加标签" onCancel={hideAddTagModal} onOk={handleAddTagFormSubmit}>
        <Form form={addTagForm} labelCol={{ span: 4 }}>
          <FormItem
            label="坐标名称"
            name="tag"
            rules={[{ required: true, message: '坐标名称不能为空' }, { validator: validateTagName }]}
          >
            <Input />
          </FormItem>
        </Form>
      </Modal>
    </>
  )
}
