import { Form, Input, Modal, Space, InputNumber, Select } from 'antd'
import { CloseOutlined, PlusOutlined } from '@ant-design/icons'
import { KeyboardEventHandler, useEffect, useReducer, useRef } from 'react'
import { simpleCloneKeep } from 'utils/toolkits'
import { RuleObject } from 'antd/lib/form'
import styles from './addGamePoint.module.scss'
import { GamePoint } from 'constants/types'

const { useForm, Item: FormItem } = Form
const InputGroup = Input.Group
const SelectOption = Select.Option

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
  const [addTagForm] = useForm()
  const [addGamePointForm] = useForm()
  const { tag, record, visible, tagList, hideModal, addGamePoint, editGamePoint, refreshData } = props
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
    if (record) {
      addGamePointForm.setFieldsValue({
        name: record.name,
        point: {
          x: record.point[0],
          y: record.point[1],
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

        addGamePointForm.setFieldsValue({
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

  const showAddTagModal = () =>
    dispatch({ type: 'SET_ADD_TAG_NAME_MODAL_VISIBLE', payload: { addTagNameModalVisible: true } })

  const hideAddTagModal = () => {
    addTagForm.resetFields()
    dispatch({ type: 'SET_ADD_TAG_NAME_MODAL_VISIBLE', payload: { addTagNameModalVisible: false } })
  }

  const validateTagName = (_: RuleObject, value: string) => {
    if (tagList.find((tag) => tag === value)) {
      return Promise.reject(new Error('标签名称已经存在'))
    }

    return Promise.resolve(value)
  }

  const handleTagChange = (value: string) => {
    if (value === 'add') {
      showAddTagModal()
      setTimeout(() => {
        addGamePointForm.setFieldsValue({
          tag: undefined,
        })
      }, 0)
    }
  }

  const handleAddTagFormSubmit = () => {
    addTagForm
      .validateFields()
      .then(({ tag }) => {
        dispatch({ type: 'SET_HAS_ADDED_TAG_NAME', payload: { hasAddedTagName: true } })
        dispatch({ type: 'SET_TRUE_TAG_NAME_LIST', payload: { trueTagNameList: [...trueTagNameList, tag] } })
        hideAddTagModal()
        addGamePointForm.setFieldsValue({
          tag,
        })
      })
      .catch((error) => {
        console.log('handleAddTagFormSubmit error: ', error)
      })
  }

  const handleDeleteTagClick = (tag: string) => {
    const nowTag = addGamePointForm.getFieldValue('tag')

    setTimeout(() => {
      addGamePointForm.setFieldsValue({
        tag: nowTag && nowTag !== tag ? nowTag : undefined,
      })
    }, 0)

    dispatch({ type: 'SET_HAS_ADDED_TAG_NAME', payload: { hasAddedTagName: false } })
    dispatch({
      type: 'SET_TRUE_TAG_NAME_LIST',
      payload: { trueTagNameList: trueTagNameList.slice(0, -1) },
    })
  }

  const handleAddGamePointFormSubmit = () => {
    addGamePointForm
      .validateFields()
      .then(async (gamePoint: GamePoint & { point: { x: number; y: number } }) => {
        if (record) {
          await editGamePoint?.({ ...gamePoint, id: record.id, point: [gamePoint.point.x, gamePoint.point.y] })
        } else {
          await addGamePoint?.({ ...gamePoint, point: [gamePoint.point.x, gamePoint.point.y] })
        }
        addGamePointForm.resetFields()
        hideModal()
        refreshData()
      })
      .catch((error) => {
        console.log('handleAddGamePointFormSubmit error: ', error)
      })
  }

  return (
    <>
      <Modal
        visible={visible}
        onCancel={hideModal}
        onOk={handleAddGamePointFormSubmit}
        title={record ? '修改坐标' : '添加坐标'}
      >
        <Form
          labelCol={{ span: 4 }}
          form={addGamePointForm}
          initialValues={{ ...(record || {}), point: { x: record?.point[0], y: record?.point[1] } }}
        >
          <FormItem label="坐标名称" name="name">
            <Input />
          </FormItem>
          <FormItem label="坐标位置">
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
            <Select onSelect={handleTagChange} optionLabelProp="value">
              {trueTagNameList.map((tag, index) => (
                <SelectOption key={tag} className={styles.tagOption}>
                  <span>{tag}</span>
                  {hasAddedTagName && index === trueTagNameList.length - 1 && (
                    <CloseOutlined className={styles.close + ' red'} onClick={handleDeleteTagClick.bind(null, tag)} />
                  )}
                </SelectOption>
              ))}
              {!hasAddedTagName && (
                <SelectOption key="add" className="red">
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
