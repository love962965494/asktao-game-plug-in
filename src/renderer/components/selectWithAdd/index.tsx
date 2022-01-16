import { Select, Space } from 'antd'
import { CloseOutlined, PlusOutlined } from '@ant-design/icons'
import { useState } from 'react'
import styles from './selectWithAdd.module.scss'

const SelectOption = Select.Option

interface ISelectWithAdd<T> {
  list: T[]
}

export function SelectWithAdd<T>(props: ISelectWithAdd<T>) {
  const { list } = props
  const [hasAdded, setHasAdded] = useState(false)

  return (
    <Select>
      {list.map((item, index) => (
        <SelectOption key={item + ''} className={styles.option}>
          <span>{item}</span>
          {hasAdded && index === list.length - 1 && <CloseOutlined className={styles.closed + ' red'} />}
          {!hasAdded && (
            <SelectOption key="add" className="red">
              <Space>
                <PlusOutlined />
                新增选项
              </Space>
            </SelectOption>
          )}
        </SelectOption>
      ))}
    </Select>
  )
}
