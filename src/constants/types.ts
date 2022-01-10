import GameAccountList from './GameAccountList.json'
import GameServerGroup from './GameServerGroup.json'

type GameAccount = typeof GameAccountList[0]['accountList'][0]
type GameAccountList = typeof GameAccountList

type GameServerGroup = typeof GameServerGroup

export { GameAccount, GameAccountList, GameServerGroup }
