const path = require('path')

const rootPath = path.join(__dirname, '../')
const srcPath = path.join(rootPath, 'src')
const srcMainPath = path.join(srcPath, 'main')
const srcRendererPath = path.join(srcPath, 'renderer')

const releasePath = path.join(rootPath, 'release');
const appPath = path.join(releasePath, 'app');
const distPath = path.join(appPath, 'dist');
const distMainPath = path.join(distPath, 'main')
const distRendererPath = path.join(distPath, 'renderer')

export default {
  rootPath,
  srcPath,
  srcMainPath,
  srcRendererPath,
  distMainPath,
  distRendererPath,
}
