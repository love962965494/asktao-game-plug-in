import { GameAccount, GameAccountList, GameServerGroup } from 'constants/types'
import { useCallback, useEffect, useState } from 'react'
import { requestByGet, requestByPost } from 'utils/http'
import { IRecord } from './components'

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
  const [gameAccountList, setGameAccountList] = useState<GameAccountList>([])
  const getGameAccountList = useCallback(async () => {
    try {
      const gameAccountList = await requestByGet<GameAccountList>('/getGameAccountList')

      setGameAccountList(gameAccountList)
    } catch (error) {
      console.log('useGameAccountList error: ', error)
    }
  }, [])

  useEffect(() => {
    getGameAccountList()
  }, [])

  return { gameAccountList, getGameAccountList }
}

export function useAddAccount() {
  const addAccount = useCallback(async (account: GameAccount) => {
    try {
      await requestByPost('/addGameAccount', account)
    } catch (error) {
      console.log('useAddAccount error: ', error)
    }
  }, [])

  return (account: GameAccount) => addAccount(account)
}

type CaptainAccountInfo = { groupName: string; captainAccount: string }
export function useChangeCaptainAccount() {
  const changeCaptainAccount = useCallback(async (accountInfo: CaptainAccountInfo) => {
    try {
      await requestByPost('/changeCaptainAccount', accountInfo)
    } catch (error) {
      console.log('useChangeCaptainAccount error: ', error)
    }
  }, [])

  return (accountInfo: CaptainAccountInfo) => changeCaptainAccount(accountInfo)
}

export function useChangeRoleBattlePlan() {
  const changeRoleBattlePlan = useCallback(async (record: IRecord) => {
    try {
      await requestByPost('/changeRoleBattlePlan', record)
    } catch (error) {
      console.log('changeRoleBattlePlan error: ', error)
    }
  }, [])

  return (record: IRecord) => changeRoleBattlePlan(record)
}
