import path from 'path'

const staticPath = path.resolve(__dirname, '../static')
const logPath = path.resolve(__dirname, '../log.txt')

const pythonPath = path.resolve(__dirname, '../python')
const pythonImagesPath = path.resolve(pythonPath, 'images')
const tesseractPath = path.resolve(__dirname, '../tesseract')
const databasePath = path.resolve(__dirname, '../database')

const srcPath = path.resolve(__dirname, '../src')
const assetsPath = path.resolve(srcPath, 'assets')
const constantsPath = path.resolve(srcPath, 'constants')
const mainPath = path.resolve(srcPath, 'main')
const rendererPath = path.resolve(srcPath, 'renderer')
const serverPath = path.resolve(srcPath, 'server')
const utilsPath = path.resolve(srcPath, 'utils')

export {
  staticPath,
  logPath,
  pythonPath,
  pythonImagesPath,
  srcPath,
  assetsPath,
  constantsPath,
  mainPath,
  rendererPath,
  serverPath,
  utilsPath,
  tesseractPath,
  databasePath
}
