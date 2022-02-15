const child_process = require('child_process')
const path = require('path')

const filePath = path.join(__dirname, './test.py')
const srcImage = path.join(__dirname, './images/temp/screenCapture.jpg')
const targetImage = path.join(__dirname, './images/GUIElements/textnote.jpg')
console.log('filePath: ', filePath)
console.log('srcImage: ', srcImage)
console.log('targetImage: ', targetImage)

const workerProcess = child_process.exec(`python -u ${filePath} ${srcImage} ${targetImage}`, (error, stdout) => {
  if (error) {
    console.log('findImagePos error: ', error)
  }
})

workerProcess.on('exit', () => {
  console.log('执行python脚本完成')
})