import { GameTask } from '../../../constants/types'
import { youdaoTask, wangyiTask, startGameTask } from './testTasks'

type IGameTask = Pick<GameTask, 'taskName'> & { taskFunction: Function }
type ITaskConfig = Array<{ tag: string; taskList: IGameTask[] }>

const taskConfigs: ITaskConfig = [
  {
    tag: '测试任务1',
    taskList: [
      {
        taskName: '模拟账户登录',
        taskFunction: startGameTask,
      },
    ],
  },
  {
    tag: '测试任务2',
    taskList: [
      {
        taskName: '有道词典输入',
        taskFunction: youdaoTask,
      },
    ],
  },
  {
    tag: '测试任务3',
    taskList: [
      {
        taskName: '网易云播放',
        taskFunction: wangyiTask,
      },
    ],
  },
]

export default taskConfigs
