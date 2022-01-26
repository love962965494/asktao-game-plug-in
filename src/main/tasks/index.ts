import { registerImageTasks } from './imageTask'
import { registerMouseTasks } from './mouseTask'
import { registerTestTasks } from './testTask'

export default function registerTasks() {
  registerMouseTasks()

  // TODO: 删除
  registerTestTasks()

  registerImageTasks()
}
