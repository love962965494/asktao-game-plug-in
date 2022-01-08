import { GameServerGroup } from 'constants/types'
import { useEffect, useState } from 'react'
import { requestByGet } from 'utils/http'

export function useGameServerGroup() {
  const [gameServerGroup, setGameServerGroup] = useState<GameServerGroup>([])

  useEffect(() => {
    async function getData() {
      const data = await requestByGet<any[]>('/getGameServerGroup')

      setGameServerGroup(data)
    }

    getData()
  }, [])

  return gameServerGroup
}

export function useGameAccountList() {
  const [gameAccountList, setGameAccountList] = useState([])
}
