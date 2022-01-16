import { Modal } from 'antd'

interface IAddGameTask {
  visible: boolean
  hideModal: () => void
}

export function AddGameTask(props: IAddGameTask) {
  const { visible } = props

  return <Modal>hhh</Modal>
}
