import { Input, Modal, Form, Button, Space } from 'antd'
import { MouseEventHandler, useEffect, useState } from 'react'
import { simpleCloneKeep } from 'utils/toolkits'
import { useGameServerGroup } from '../../hooks'
import styles from './gameServerGroup.module.scss'

const FormItem = Form.Item

interface IGameServerGroup {
  onChange?: (args: any) => void
}

export function GameServerGroup({ onChange }: IGameServerGroup) {
  const [form] = Form.useForm()
  const gameServerGroup = useGameServerGroup()
  const [visible, setVisible] = useState(false)
  const [serverGroup, setServerGroup] = useState<[string, string]>(['', ''])
  const [filterGameServerGroup, setFilterGameServerGroup] = useState(gameServerGroup)

  useEffect(() => {
    setFilterGameServerGroup(simpleCloneKeep(gameServerGroup))
  }, [gameServerGroup])

  useEffect(() => {
    const serverGroupString = serverGroup.filter(Boolean).join('/')
    if (serverGroupString) {
      onChange?.(serverGroupString)
    }
  }, [serverGroup])

  const handleInputClick = () => setVisible(true)

  const handleServerGroupClick: MouseEventHandler<HTMLUListElement> = ($event) => {
    const { target, currentTarget } = $event as unknown as { target: HTMLElement; currentTarget: HTMLUListElement }
    const role = currentTarget.getAttribute('role')

    if (target.tagName === 'LI') {
      const name = target.getAttribute('value') || ''

      if (role === 'server') {
        setServerGroup([name, ''])
      } else {
        setServerGroup([serverGroup[0], name])
      }
    }
  }

  const handleFormSubmit = (values: { name?: string }) => {
    const { name = '' } = values

    const filterGameServerGroup = gameServerGroup
      .filter((item) => item.name.includes(name) || item.children.find((item) => item.name.includes(name)))
      .map((item) => {
        return {
          ...item,
          children: item.children.filter((item) => item.name.includes(name)),
        }
      })

    setFilterGameServerGroup(filterGameServerGroup)
  }

  const handleFormReset = () => {
    form.resetFields()

    setFilterGameServerGroup(simpleCloneKeep(gameServerGroup))
  }

  const handleModalSubmit = () => setVisible(false)

  const handleModalCancel = () => {
    setVisible(false)
    setServerGroup(['', ''])
  }

  return (
    <div>
      <Input readOnly onClick={handleInputClick} value={serverGroup.filter(Boolean).join(' / ')} />
      <Modal visible={visible} title="选择区组" onOk={handleModalSubmit} onCancel={handleModalCancel}>
        <Form layout="inline" onFinish={handleFormSubmit} form={form}>
          <FormItem label="区组名" name="name">
            <Input />
          </FormItem>
          <FormItem>
            <Space>
              <Button type="primary" htmlType="submit">
                搜索
              </Button>
              <Button onClick={handleFormReset}>重置</Button>
            </Space>
          </FormItem>

          <div className={styles.top}>
            <ul onClick={handleServerGroupClick} role="server">
              {filterGameServerGroup.map((item) => (
                <li key={item.name} className={serverGroup[0] === item.name ? styles.checked : ''} value={item.name}>
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.bottom}>
            <ul onClick={handleServerGroupClick} role="subServer">
              {filterGameServerGroup
                .find((item) => item.name === serverGroup[0])
                ?.children.map((item) => (
                  <li key={item.name} className={serverGroup[1] === item.name ? styles.checked : ''} value={item.name}>
                    {item.name}
                  </li>
                ))}
            </ul>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
