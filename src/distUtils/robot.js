"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _robotjs = _interopRequireDefault(require("robotjs"));
var _random = _interopRequireDefault(require("random"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function getRandomNum() {
  var min = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5;
  var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 20;
  var num = _random["default"].integer(min, max);
  return num;
}
var robotUtils = {
  moveMouseSmooth: function moveMouseSmooth(x, y) {
    var speed = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
    var num = getRandomNum();
    _robotjs["default"].moveMouseSmooth(x, y, speed);
    _robotjs["default"].setMouseDelay(num);
  },
  moveMouse: function moveMouse(x, y) {
    var num = getRandomNum();
    _robotjs["default"].moveMouse(x, y);
    _robotjs["default"].setMouseDelay(num);
  },
  mouseClick: function mouseClick(button, _double) {
    var num = getRandomNum();
    _robotjs["default"].mouseClick(button, _double);
    _robotjs["default"].setMouseDelay(num);
  },
  keyTap: function keyTap(key, modifer) {
    var num = getRandomNum();
    if (modifer) {
      _robotjs["default"].keyTap(key, modifer);
    } else {
      _robotjs["default"].keyTap(key);
    }
    _robotjs["default"].setKeyboardDelay(num);
  },
  // 处理字符串输入
  handleCharKeyTap: function handleCharKeyTap(_char) {
    if (/[A-Z]/.test(_char)) {
      _robotjs["default"].keyToggle('shift', 'down');
      robotUtils.keyTap(_char.toLowerCase());
      _robotjs["default"].keyToggle('shift', 'up');
    } else if (_char === '*') {
      _robotjs["default"].keyToggle('shift', 'down');
      robotUtils.keyTap('8');
      _robotjs["default"].keyToggle('shift', 'up');
    } else {
      robotUtils.keyTap(_char);
    }
  }
};
var _default = exports["default"] = robotUtils;