import { Button, Checkbox, Form, Radio, Select, Space } from 'antd'
import { useGameTaskList } from './hooks'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const SelectOption = Select.Option

export default function TaskManage() {
  const { gameTaskList, getGameTaskList } = useGameTaskList()

  return (
    <Form>
      <FormItem>
        <Button type="primary">添加</Button>
      </FormItem>

      <h2 className="title descriptions">
        <Space>
          <span>
            正在执行：<span>师门任务</span>
          </span>
          <span>
            奖励类型：
            <RadioGroup defaultValue="1">
              <Radio value="1">经验奖励</Radio>
              <Radio value="2">道行奖励</Radio>
            </RadioGroup>
          </span>
          <span>
            当前方案：
            <Select defaultValue="1" style={{ width: 150 }}>
              <SelectOption key="1" value="1">
                方案一
              </SelectOption>
              <SelectOption key="2" value="2">
                方案二
              </SelectOption>
              <SelectOption key="3" value="3">
                方案三
              </SelectOption>
            </Select>
          </span>
        </Space>
      </h2>

      {gameTaskList.map((item) => (
        <div>
          <h3 className="title descriptions">
            <Space>
              <span>
                任务类型：<span>{item.tag}</span>
              </span>

              <ul>
                {item.taskList.map((item) => (
                  <li key={item.id}>
                    <Space>
                      <Checkbox>{item.name}</Checkbox>
                      <span>
                        活跃度：<span>{item.liveness}</span>
                      </span>
                    </Space>
                  </li>
                ))}
              </ul>
            </Space>
          </h3>
        </div>
      ))}
    </Form>
  )
}
