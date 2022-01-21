import GameServerGroupData from './GameServerGroup.json'

/**
 * 登录状态
 */
export type ILoginStatus = '已登录' | '离线'

/**
 * 账号角色信息
 */
export type GameAccount = {
  id: string
  account: string
  password: string
  rank?: number
  roleName?: string
  loginStatus?: ILoginStatus
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
  name: string
  // 任务次数
  count?: number
  // 活跃度
  liveness?: number
  // 权重
  weight?: number
}

/**
 * 游戏任务分组
 */
export type GameTaskList = Array<{
  tag: string
  taskList: GameTask[]
}>

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