import path from 'path'

const pythonPath = path.resolve(__dirname, '../python')
const pythonImagesPath = path.resolve(pythonPath, 'images')

const srcPath = path.resolve(__dirname, '../src')
const assetsPath = path.resolve(srcPath, 'assets')
const constantsPath = path.resolve(srcPath, 'constants')
const mainPath = path.resolve(srcPath, 'main')
const rendererPath = path.resolve(srcPath, 'renderer')
const serverPath = path.resolve(srcPath, 'server')
const utilsPath = path.resolve(srcPath, 'utils')

export {
  pythonPath,
  pythonImagesPath,
  srcPath,
  assetsPath,
  constantsPath,
  mainPath,
  rendererPath,
  serverPath,
  utilsPath,
}
