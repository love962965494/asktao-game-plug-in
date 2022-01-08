const path = require('path')

const rootPath = path.join(__dirname, '../')
const srcPath = path.join(rootPath, 'src')
const srcMainPath = path.join(srcPath, 'main')
const srcRendererPath = path.join(srcPath, 'renderer')
const srcServerPath = path.join(srcPath, 'server')
const srcConstantsPath = path.join(srcPath, 'constants')
const srcUtilsPath = path.join(srcPath, 'utils')
const srcAssetsPath = path.join(srcPath, 'assets')

const releasePath = path.join(rootPath, 'release')
const appPath = path.join(releasePath, 'app')
const distPath = path.join(appPath, 'dist')
const distMainPath = path.join(distPath, 'main')
const distRendererPath = path.join(distPath, 'renderer')

export default {
  rootPath,
  srcPath,
  srcMainPath,
  srcRendererPath,
  srcServerPath,
  srcConstantsPath,
  srcUtilsPath,
  srcAssetsPath,

  distMainPath,
  distRendererPath,
}
