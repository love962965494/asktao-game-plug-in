import { GameTaskList } from 'constants/types'
import { useCallback, useEffect, useState } from 'react'
import { requestByGet } from 'utils/http'

export function useGameTaskList() {
  const [gameTaskList, setGameTaskList] = useState<GameTaskList>([])

  const getGameTaskList = useCallback(async () => {
    try {
      const gameTaskList = await requestByGet<GameTaskList>('/getGameTaskList')

      setGameTaskList(gameTaskList)
    } catch (error) {
      console.log('useGameTaskList error: ', error)
    }
  }, [])

  useEffect(() => {
    getGameTaskList()
  }, [])

  return { gameTaskList, getGameTaskList }
}
