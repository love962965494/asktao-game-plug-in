const fs = require('fs/promises')
const path = require('path')
const { parentPort } = require('worker_threads')

parentPort.on('message', fileName => {
  const configPath = path.join(path.join(__dirname, '../../constants'), fileName);

  fs.readFile(configPath, 'utf-8').then(content => {
    parentPort?.postMessage({ type: fileName.slice(0, -5), content: JSON.parse(content) })
  })
})