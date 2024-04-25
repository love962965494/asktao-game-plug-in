import { registerImageTasks } from './imageTask'
import { registerMonitorTasks } from './monitorTask'
import { registerQuanMinShuaDao } from './quanMin'
import { registerYiJianQianDao } from './riChangQianDao'
import { registerTestTasks } from './testTask'

import { registerXianRenZhiLu } from './xiuXing'

export default function registerTasks() {

  // TODO: 删除
  registerTestTasks()

  registerImageTasks()

  // TODO: 监控任务，之后想办法使用一个单独的进程执行这些任务
  registerMonitorTasks()

  // 仙人指路
  registerXianRenZhiLu()

  // 全民刷道
  registerQuanMinShuaDao()

  // 日常签到
  registerYiJianQianDao()
}
