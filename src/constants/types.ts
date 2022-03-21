import GameServerGroupData from './GameServerGroup.json'

/************************************* 游戏账户管理 *******************************/

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
  // 战斗方案
  battlePlan: number[]
}

/**
 * 账号角色信息
 */
export type GameAccount = {
  id: string
  account: string
  password: string
  // 是否是队长
  isCaptain: boolean
  roleList: Partial<RoleStatus>[]
}

/**
 * 账号分组信息
 */
export type GameAccountList = Array<{
  thread?: number
  groupName: string
  // 队长账号
  captainAccount: string
  accountList: GameAccount[]
  serverGroup: [string, string]
}>

/**
 * 游戏区组
 */
export type GameServerGroup = typeof GameServerGroupData

/************************************* 游戏坐标管理 *******************************/

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

/************************************* 游戏任务管理 *******************************/

/**
 * 任务基本信息
 */
type GameTaskBasicInfo = {
  id: string
  taskName: string
  // 组队任务或者单人任务
  taskType: 'group' | 'single'
}

export enum GameTaskLimitType {
  '日常任务' = 1,
  '限时活动' = 2,
}

/**
 * 任务额外信息，针对不同任务做的特殊处理
 */
type GameTaskExtraInfo = {
  // 任务次数
  taskCount: number
  // 活跃度
  liveness: number
  /**
   * 限时任务类型
   */
  taskLimitType: GameTaskLimitType
  /**
   * 任务日期，[开始日期，结束日期]
   */
  taskDate: [string, string][]
  /**
   * 任务时间，[开始时间，结束时间]
   */
  taskTime: [string, string][]
  // 用于表示任务方案中当前任务是否选中
  checked: boolean
}

/**
 * 游戏任务
 */
export type GameTask = GameTaskBasicInfo & Partial<GameTaskExtraInfo>

/**
 * 游戏任务分组
 */
export type GameTaskList = Array<{
  tag: string
  taskList: GameTask[]
}>

/************************************* 游戏任务方案管理 *******************************/

/**
 * 游戏方案
 */
export type GameTaskPlan = {
  id: string
  planName: string
  // 执行该方案的账号分组
  accountGroups: Array<GameAccountList[0]['groupName']>
  gameTaskList: Array<{ tag: string; taskList: Array<{ id: GameTask['id']; checked: boolean }> }>
}

// 游戏方案列表
export type GameTaskPlanList = GameTaskPlan[]

/************************************* 其他类型管理 *******************************/

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
