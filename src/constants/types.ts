import Accounts from './accounts.json'
import NPC from './npc.json'
import GameTask from './GameTask.json'
import GamePoints from './gamePoints.json'
import GameConfig from './gameConfig.json'
import CityMap from './cityMap.json'

/************************************* 游戏账户管理 *******************************/
export type IAllAccounts = typeof Accounts
export type IGroupOfAccounts = IAllAccounts[0]
export type IAccountInfo = IGroupOfAccounts[0]


/************************************* 游戏NPC管理 *******************************/
export type INPC = typeof NPC


/************************************* 游戏任务管理 *******************************/
export type IGameTask = typeof GameTask

/************************************* 游戏坐标管理 *******************************/
export type IGamePoints = typeof GamePoints

/************************************* 游戏配置管理 *******************************/
export type IGameConfig = typeof GameConfig

/** 游戏地图信息 */
export type ICityMap = typeof CityMap