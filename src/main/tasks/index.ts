import { registerMouseTasks } from './mouseTask'
import { registerTestTasks } from './testTask'

export default function registerTasks() {
  registerMouseTasks()

  registerTestTasks()
}
