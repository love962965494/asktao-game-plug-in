"use strict";
exports.__esModule = true;
var path = require('path');
var rootPath = path.join(__dirname, '../');
var srcPath = path.join(rootPath, 'src');
var srcMainPath = path.join(srcPath, 'main');
var srcRendererPath = path.join(srcPath, 'renderer');
var releasePath = path.join(rootPath, 'release');
var appPath = path.join(releasePath, 'app');
var distPath = path.join(appPath, 'dist');
var distMainPath = path.join(distPath, 'main');
var distRendererPath = path.join(distPath, 'renderer');
exports["default"] = {
    rootPath: rootPath,
    srcPath: srcPath,
    srcMainPath: srcMainPath,
    srcRendererPath: srcRendererPath,
    distMainPath: distMainPath,
    distRendererPath: distRendererPath
};
//# sourceMappingURL=webpack.paths.js.map