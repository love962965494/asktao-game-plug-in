import { Form, Button, List, Avatar } from 'antd'
import { AddAccount } from './components'

const FormItem = Form.Item
const ListItem = List.Item
const ListItemMeta = ListItem.Meta

export default function AccountListManage() {
  const data = []

  return (
    <Form>
      <FormItem>
        <Button type="primary">添加</Button>
      </FormItem>
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) => (
          <ListItem>
            <ListItemMeta
              avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
              title={<a href="#">{item.roleName}</a>}
              description={item.description}
            />
          </ListItem>
        )}
      />

      <AddAccount />
    </Form>
  )
}
