import { Worker } from 'worker_threads'
import path from 'path'
import goToNPC from './goToNPC'
import { MyPromise } from '../../utils/customizePromise'

export default function registerWorkers() {
  // 读取配置文件
  const worker = new Worker(path.join(__dirname, './readConstantsWorker.js'))
  worker.postMessage('accounts.json')
  worker.postMessage('npc.json')
  worker.postMessage('gameTask.json')
  worker.postMessage('gamePoints.json')
  worker.postMessage('gameConfig.json')
  worker.postMessage('cityMap.json')
  worker.on('message', ({ content, type }) => {
    global.appContext[type] = content
  })
}
