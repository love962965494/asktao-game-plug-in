import { AddGameTask, IAddGameTask } from '../addGameTask'

type IEditGameTask = IAddGameTask

export function EditGameTask(props: IEditGameTask) {
  return <AddGameTask {...props} />
}
