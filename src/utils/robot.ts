import robotjs, { moveMouse } from 'robotjs'
import random from 'random'

function getRandomNum(min: number = 5, max: number = 20) {
  const num = random.integer(min, max)
  console.log('getRandomNum num: ', num)

  return num
}
const robot = {
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

    robotjs.keyTap(key, modifer)
    robotjs.setKeyboardDelay(num)
  },
}

export default robot
