import { GameTask } from '../../../constants/types'
import { youdaoTask, wangyiTask, startGameTask, testTimeLimitSingleTask } from './testTasks'

type IGameTask = Pick<GameTask, 'taskName' | 'id'> & { taskFunction: Function }
type ITaskConfig = Array<{ tag: string; taskList: IGameTask[] }>

const taskConfigs: ITaskConfig = [
  {
    tag: '测试任务',
    taskList: [
      {
        taskName: '模拟账户登录',
        taskFunction: startGameTask,
        id: 'fc59a3eb-2724-4724-9147-c1bbfc6d022b',
      },
      {
        taskName: '有道词典输入',
        taskFunction: youdaoTask,
        id: '5081644a-47ea-4f23-840d-88298b8e9e11',
      },
      {
        taskName: '网易云播放',
        taskFunction: wangyiTask,
        id: 'eac2f6d7-27de-4320-938c-478d5ec8ca93',
      },
    ],
  },
  {
    tag: '限时任务',
    taskList: [
      {
        taskName: '测试单人限时任务',
        taskFunction: testTimeLimitSingleTask,
        id: 'eeb8269e-6df8-4c2f-8107-8a2b3d64d720',
      },
    ],
  },
]

export default taskConfigs
