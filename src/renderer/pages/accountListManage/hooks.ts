import { GameAccount, GameAccountList, GameServerGroup } from 'constants/types'
import { useCallback, useEffect, useState } from 'react'
import { requestByGet, requestByPost } from 'utils/http'

export function useGameServerGroup() {
  const [gameServerGroup, setGameServerGroup] = useState<GameServerGroup>([])

  useEffect(() => {
    async function getData() {
      const data = await requestByGet<GameServerGroup>('/getGameServerGroup')

      setGameServerGroup(data)
    }

    getData()
  }, [])

  return gameServerGroup
}

export function useGameAccountList() {
  const [loading, setLoading] = useState(false)
  const [gameAccountList, setGameAccountList] = useState<GameAccountList>([])
  const getGameAccountList = useCallback(async () => {
    try {
      setLoading(true)
      const data = await requestByGet<GameAccountList>('/getGameAccountList')
      setGameAccountList(data)
    } catch (error) {
      console.log('useGameAccountList error: ', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getGameAccountList()
  }, [])

  return { loading, gameAccountList, getGameAccountList }
}

export function useAddAccount() {
  const addAccount = useCallback(async (account: GameAccount) => {
    await requestByPost('/addGameAccount', account)
  }, [])

  return (account: GameAccount) => addAccount(account)
}
