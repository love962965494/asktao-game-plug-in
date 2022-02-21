import { GameTask, GameTaskList, GameTaskPlan, GameTaskPlanList } from 'constants/types'
import { useCallback, useEffect, useState } from 'react'
import { requestByGet, requestByPost } from 'utils/http'

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

export function useAddGameTask() {
  const addGameTask = useCallback(async (gameTask: GameTask) => {
    try {
      await requestByPost('/addGameTask', gameTask)
    } catch (error) {
      console.log('useAddGameTask error: ', error)
    }
  }, [])

  return (gamePoint: GameTask) => addGameTask(gamePoint)
}

export function useEditGameTask() {
  const editGameTask = useCallback(async (gameTask: GameTask) => {
    try {
      await requestByPost('/editGameTask', gameTask)
    } catch (error) {
      console.log('useEditGameTask error: ', error)
    }
  }, [])

  return (gameTask: GameTask) => editGameTask(gameTask)
}

export function useGameTaskPlanList() {
  const [gameTaskPlanList, setGameTaskPlanList] = useState<GameTaskPlanList>([])

  const getGameTaskPlanList = useCallback(async () => {
    try {
      const gameTaskPlanList = await requestByGet<GameTaskPlanList>('/getGameTaskPlanList')

      setGameTaskPlanList(gameTaskPlanList)
    } catch (error) {
      console.log('useTaskPlanList error: ', error)
    }
  }, [])

  useEffect(() => {
    getGameTaskPlanList()
  }, [])

  return { gameTaskPlanList, getGameTaskPlanList }
}

export function useAddGameTaskPlan() {
  const addGameTaskPlan = useCallback(async (gameTaskPlan: GameTaskPlan) => {
    try {
      await requestByPost('/addGameTaskPlan', gameTaskPlan)
    } catch (error) {
      console.log('useAddGameTaskPlan error: ', error)
    }
  }, [])

  return (gameTaskPlan: GameTaskPlan) => addGameTaskPlan(gameTaskPlan)
}

export function useEditGameTaskPlan() {
  const editGameTaskPlan = useCallback(async (gameTaskPlan: GameTaskPlan) => {
    try {
      await requestByPost('/editGameTaskPlan', gameTaskPlan)
    } catch (error) {
      console.log('useEditGameTaskPlan error: ', error)
    }
  }, [])

  return (gameTaskPlan: GameTaskPlan) => editGameTaskPlan(gameTaskPlan)
}

export function useRemoveGameTaskPlan() {
  const remoceGameTaskPlan = useCallback(async ({ id }: { id: string }) => {
    try {
      await requestByPost('/removeGameTaskPlan', { id })
    } catch (error) {
      console.log('useRemoveGameTaskPlan error: ', error)
    }
  }, [])

  return (id: string) => remoceGameTaskPlan({ id })
}
