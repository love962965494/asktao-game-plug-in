import { GamePoint, GamePointList } from 'constants/types'
import { useState, useCallback, useEffect } from 'react'
import { requestByGet, requestByPost } from 'utils/http'

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

export function useAddGamePoint() {
  const addGamePoint = useCallback(async (gamePoint: GamePoint) => {
    try {
      await requestByPost('/addGamePoint', gamePoint)
    } catch (error) {
      console.log('useAddGamePoint error: ', error)
    }
  }, [])

  return (gamePoint: GamePoint) => addGamePoint(gamePoint)
}

export function useEditGamePoint() {
  const editGamePoint = useCallback(async (gamePoint: GamePoint) => {
    try {
      await requestByPost('/editGamePoint', gamePoint)
    } catch (error) {
      console.log('useEditGamePoint error: ', error)
    }
  }, [])

  return (gamePoint: GamePoint) => editGamePoint(gamePoint)
}
