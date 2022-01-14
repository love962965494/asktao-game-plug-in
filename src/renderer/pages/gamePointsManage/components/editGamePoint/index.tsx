import { AddGamePoint, IAddGamePoint } from '../addGamePoint'

type IEditGamePoint = IAddGamePoint

export function EditGamePoint(props: IEditGamePoint) {
  return <AddGamePoint {...props} />
}
