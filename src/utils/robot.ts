import robotjs from 'robotjs'
import random from 'random'

function getRandomNum(min: number = 5, max: number = 20) {
  const num = random.integer(min, max)

  return num
}

const robotUtils = {
  moveMouseSmooth(x: number, y: number, speed: number = 3) {
    const num = getRandomNum()

    robotjs.moveMouseSmooth(x, y, speed)
    robotjs.setMouseDelay(num)
  },
  moveMouse(x: number, y: number) {
    const num = getRandomNum()

    robotjs.moveMouse(x, y)
    robotjs.setMouseDelay(num)
  },
  mouseClick(button: 'left' | 'right', double?: boolean) {
    const num = getRandomNum()

    robotjs.mouseClick(button, double)
    robotjs.setMouseDelay(num)
  },
  keyTap(key: string, modifer?: string | string[]) {
    const num = getRandomNum()

    if (modifer) {
      robotjs.keyTap(key, modifer)
    } else {
      robotjs.keyTap(key)
    }
    robotjs.setKeyboardDelay(num)
  },
  // 处理字符串输入
  handleCharKeyTap(char: string) {
    if (/[A-Z]/.test(char)) {
      robotjs.keyToggle('shift', 'down')
      robotUtils.keyTap(char.toLowerCase())
      robotjs.keyToggle('shift', 'up')
    } else if (char === '*') {
      robotjs.keyToggle('shift', 'down')
      robotUtils.keyTap('8')
      robotjs.keyToggle('shift', 'up')
    } else {
      robotUtils.keyTap(char)
    }
  },
}

export default robotUtils
