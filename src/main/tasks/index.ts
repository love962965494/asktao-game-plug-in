import { registerLoginTasks } from './loginTask'
import { registerMonitorTasks } from './monitorTask'
import { registerQuanMin } from './quanMin'
import { registerYiJianQianDao } from './riChang'
import { registerXianShiHuoDong } from './xianShiTasks'
import { registerXiuXing } from './xiuXing'

export default function registerTasks() {
  // 游戏启动
  registerLoginTasks()

  // TODO: 监控任务，之后想办法使用一个单独的进程执行这些任务
  registerMonitorTasks()

  // 修行活动：十绝阵、仙人指路、修行任务、悬赏BOSS等等
  registerXiuXing()

  // 全民任务，刷道、升级等
  registerQuanMin()

  // 日常签到
  registerYiJianQianDao()

  // 限时活动
  registerXianShiHuoDong()
}
