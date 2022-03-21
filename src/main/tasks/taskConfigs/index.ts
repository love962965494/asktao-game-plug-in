import { GameTask } from '../../../constants/types'
import { shimenTask, shuadaoTask, startGameTask, testTimeLimitSingleTask } from './testTasks'

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
    ],
  },
  {
    tag: '限时任务',
    taskList: [],
  },
  {
    tag: '日常活动',
    taskList: [
      {
        taskName: '师门任务',
        taskFunction: shimenTask,
        id: '3c30adde-7a16-4f18-8d88-2d102ef346d6',
      },
      {
        taskName: '刷道任务',
        taskFunction: shuadaoTask,
        id: 'ac49f344-37a4-4fcd-823d-805cff0baf63',
      },
      {
        taskName: '修山任务',
        taskFunction: () => {},
        id: '23c161c3-1592-4b98-b50e-fd76ef8ea07f',
      },
    ],
  },
]

export default taskConfigs
