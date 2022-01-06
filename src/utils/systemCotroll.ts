import { exec } from 'child_process'

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

  return new Promise((resolve, reject) => {
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

          return [pName, pId]
        })

      resolve(processes)
    })
  })
}

export { getProcessesByName }
