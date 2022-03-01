import { GameTask } from '../../../constants/types'
import { youdaoTask, wangyiTask, startGameTask, testTimeLimitSingleTask } from './testTasks'

type IGameTask = Pick<GameTask, 'taskName'> & { taskFunction: Function }
type ITaskConfig = Array<{ tag: string; taskList: IGameTask[] }>

const taskConfigs: ITaskConfig = [
  {
    tag: '测试任务',
    taskList: [
      {
        taskName: '模拟账户登录',
        taskFunction: startGameTask,
      },
      {
        taskName: '有道词典输入',
        taskFunction: youdaoTask,
      },
      {
        taskName: '网易云播放',
        taskFunction: wangyiTask,
      },
    ],
  },
  {
    tag: '限时任务',
    taskList: [
      {
        taskName: '测试单人限时任务',
        taskFunction: testTimeLimitSingleTask,
      },
    ],
  },
]

export default taskConfigs
