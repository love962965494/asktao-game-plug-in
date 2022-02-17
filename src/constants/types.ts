import GameServerGroupData from './GameServerGroup.json'

/**
 * 登录状态
 */
export type ILoginStatus = '已登录' | '离线'

/**
 * 账户角色状态信息
 */
export type RoleStatus = {
  // 角色等级
  rank: number
  // 角色姓名
  roleName: string
  // 角色头像
  roleAvatar: string
  // 当前是该账户下的第几个角色
  roleOrder: 1 | 2 | 3 | 4
  // 当前执行任务
  currentTask: string
  // 登录状态
  loginStatus: ILoginStatus
  // 战斗方案
  battlePlan: [number, number]
}

/**
 * 账号角色信息
 */
export type GameAccount = {
  id: string
  account: string
  password: string
  roleInfo: Partial<RoleStatus>
}

/**
 * 账号分组信息
 */
export type GameAccountList = Array<{
  thread?: number
  groupName: string
  accountList: GameAccount[]
  serverGroup: [string, string]
}>

/**
 * 游戏区组
 */
export type GameServerGroup = typeof GameServerGroupData

/**
 * 坐标
 */
export type Point = {
  x: number
  y: number
}

/**
 * 游戏坐标
 */
export type GamePoint = {
  id: string
  name: string
  shortcut?: string
  point: Point
}

/**
 * 游戏坐标分组
 */
export type GamePointList = Array<{
  tag: string
  pointList: GamePoint[]
}>

/**
 * 游戏任务
 */
export type GameTask = {
  id: string
  taskName: string
  // 任务次数
  taskCount: number
  // 活跃度
  liveness?: number
  // 组队任务或者单人任务
  taskType?: 'group' | 'single'
}

/**
 * 游戏任务分组
 */
export type GameTaskList = Array<{
  tag: string
  taskList: GameTask[]
}>

/**
 * 游戏方案
 */
export type GameTaskPlan = {
  id: string
  planName: string
  gameTaskList: GameTaskList
}

// 游戏方案列表
export type GameTaskPlanList = GameTaskPlan[]

/**
 * 方向
 */
export enum Directions {
  Middle = 'middle',
  Left = 'left',
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
}
