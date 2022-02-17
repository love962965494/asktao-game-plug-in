import { Select, Space, Modal, Form, Input } from 'antd'
import { CloseOutlined, PlusOutlined } from '@ant-design/icons'
import { ReactNode, useEffect, useReducer } from 'react'
import styles from './selectWithAdd.module.scss'
import { simpleCloneKeep } from 'utils/toolkits'
import { useForm } from 'antd/lib/form/Form'
import { RuleObject } from 'antd/lib/form'

const SelectOption = Select.Option
const FormItem = Form.Item

interface ISelectWithAdd<T> {
  list: T[]
  value?: string
  onChange?: (args: any) => void
  onSelectChange?: (value: string) => void
  onDeleteBtnClick?: (value: string) => void
  renderOptionItem?: (item: T) => ReactNode
}

interface IState<T> {
  trueList: T[]
  visible: boolean
  hasAdded: boolean
  value: string
}

type IActionTypes = 'SET_TRUE_LIST' | 'SET_VISIBLE' | 'SET_HAS_ADDED' | 'SET_VALUE'

function reducer<T>(state: IState<T>, action: { type: IActionTypes; payload: Partial<IState<T>> }) {
  switch (action.type) {
    case 'SET_HAS_ADDED':
    case 'SET_TRUE_LIST':
    case 'SET_VALUE':
    case 'SET_VISIBLE':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

export function SelectWithAdd<T>(props: ISelectWithAdd<T>) {
  const initialState: IState<T> = {
    trueList: [],
    visible: false,
    hasAdded: false,
    value: '',
  }

  const { list, onChange, onSelectChange, onDeleteBtnClick, renderOptionItem, value: outerValue } = props
  const [form] = useForm()

  const [state, dispatch] = useReducer(reducer, initialState)
  const { trueList, visible, hasAdded, value } = state as IState<typeof list[0]>

  useEffect(() => {
    dispatch({ type: 'SET_VALUE', payload: { value: outerValue } })
  }, [outerValue])

  useEffect(() => {
    dispatch({ type: 'SET_TRUE_LIST', payload: { trueList: simpleCloneKeep(list) } })
  }, [list])

  const showAddModal = () => dispatch({ type: 'SET_VISIBLE', payload: { visible: true } })
  const hideAddModal = () => dispatch({ type: 'SET_VISIBLE', payload: { visible: false } })

  const handleSelectChange = (value: string) => {
    if (value === 'add') {
      showAddModal()
      setTimeout(() => {
        onChange?.(outerValue === value ? '' : outerValue)
      }, 0)
    }

    onChange?.(value)
    onSelectChange?.(value)
  }

  const handleDeleteBtnClick = (name: string) => {
    dispatch({ type: 'SET_HAS_ADDED', payload: { hasAdded: false } })
    dispatch({ type: 'SET_TRUE_LIST', payload: { trueList: trueList.slice(0, -1) } })
    setTimeout(() => {
      onChange?.(outerValue === name ? '' : outerValue)
    }, 0)

    onDeleteBtnClick?.(name)
  }

  const validateName = (_: RuleObject, value: string) => {
    if (trueList.find((item) => item + '' === value)) {
      return Promise.reject(new Error('选项已经存在'))
    }

    return Promise.resolve(value)
  }

  const handleFormSubmit = () => {
    form
      .validateFields()
      .then(({ name }) => {
        dispatch({ type: 'SET_HAS_ADDED', payload: { hasAdded: true } })
        dispatch({ type: 'SET_TRUE_LIST', payload: { trueList: [...trueList, name] } })

        hideAddModal()
        form.resetFields()
      })
      .catch((error) => {
        console.log('handleFormSubmit error: ', error)
      })
  }

  return (
    <>
      <Select onSelect={handleSelectChange} optionLabelProp="value" value={value}>
        {trueList.map((item, index) => (
          <SelectOption className={styles.option} key={item + ''}>
            {renderOptionItem ? renderOptionItem(item) : <span>{item}</span>}
            {hasAdded && index === trueList.length - 1 && (
              <CloseOutlined className={styles.close + ' red'} onClick={handleDeleteBtnClick.bind(null, item + '')} />
            )}
          </SelectOption>
        ))}

        {!hasAdded && (
          <SelectOption key="add" className="red">
            <Space>
              <PlusOutlined />
              新增选项
            </Space>
          </SelectOption>
        )}
      </Select>

      <Modal title="新增选项" visible={visible} onCancel={hideAddModal} onOk={handleFormSubmit}>
        <Form form={form} labelCol={{ span: 4 }}>
          <FormItem
            label="名称"
            name="name"
            rules={[{ required: true, message: '名称不能为空' }, { validator: validateName }]}
          >
            <Input />
          </FormItem>
        </Form>
      </Modal>
    </>
  )
}
