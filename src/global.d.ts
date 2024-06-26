import { IAllAccounts, ICityMap, IGameConfig, IGamePoints, IGameTask, INPC } from 'constants/types'

declare module '*.module.scss' {
  const classes: { [key: string]: string }
  export default classes
}

declare global {
  var appContext: {
    isInterrupted: boolean
    accounts: IAllAccounts
    npc: INPC
    gameTask: IGameTask
    gamePoints: IGamePoints
    mousePositions: { position: [number, number]; size: [number, number] }[]
    gameConfig: IGameConfig
    cityMap: ICityMap
    hasFoundTarget: { [key: string]: boolean }
  }
}

export {}
