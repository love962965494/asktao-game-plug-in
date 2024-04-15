import { exec } from 'child_process'
import GameWindowControl from './gameWindowControll'
import { MyPromise } from './customizePromise'

/**
 *  游戏进程信息，[pName, pId]
 */
export type GameProcess = [string, string]

/**
 * @description 根据进程名获取系统进程
 * @returns [pNmae, pId][]
 */
function getProcessesByName(name: string): Promise<GameProcess[]> {
  const cmd = process.platform === 'win32' ? 'tasklist' : 'ps aux'

  return MyPromise((resolve, reject) => {
    exec(cmd, function (err, stdout) {
      if (err) {
        console.log('getProcessesByName error: ', err)

        reject(err)

        return
      }

      const processes = stdout
        .split('\n')
        .filter((item) => item.includes(name))
        .map((item) => {
          const [pName, pId] = item.trim().split(/\s+/)

          return [pName, pId] as GameProcess
        })

      resolve(processes)
    })
  })
}

/**
 * @description 根据进程名杀死进程
 * @param name 进程名
 */
async function killProcessesByName(name: string) {
  const processes = await getProcessesByName(name)
  if (processes.length === 0) {
    return
  }
  const cmd = process.platform === 'win32' ? `taskkill /im ${name} /f` : `pkill -f ${name}`

  return MyPromise((resolve, reject) => {
    exec(cmd, (error) => {
      if (error) {
        console.error(`执行的错误: ${error}`)
        reject('error')
        return
      }
      resolve('success')
    })
  })
}

// 获取游戏窗口
async function getGameWindows() {
  const processes = await getProcessesByName('asktao')

  processes.forEach(([_, pId]) => {
    new GameWindowControl(+pId)
  })

  const allGameWindows = GameWindowControl.getAllGameWindows().values()

  for (const gameWindow of allGameWindows) {
    gameWindow.maximizGameWindow()
  }

  return allGameWindows
}

export { getProcessesByName, killProcessesByName, getGameWindows }
