import { GamePointList } from 'constants/types'
import { useState, useCallback, useEffect } from 'react'
import { requestByGet } from 'utils/http'

export function useGamePointList() {
  const [gamePointList, setGamePointList] = useState<GamePointList>([])

  const getGamePointList = useCallback(async () => {
    try {
      const gamePointList = await requestByGet<GamePointList>('/getGamePointList')

      setGamePointList(gamePointList)
    } catch (error) {
      console.log('useGamePoints error: ', error)
    }
  }, [])

  useEffect(() => {
    getGamePointList()
  }, [])

  return { gamePointList, getGamePointList }
}
