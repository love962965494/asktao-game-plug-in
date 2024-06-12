import cv2
import numpy as np
import pyautogui
import sys

# 动态捕捉目标位置
# 读取目标图像
def findTarget(target_img_path):
    target_img = cv2.imread(target_img_path, cv2.IMREAD_GRAYSCALE)  # 以灰度模式读取目标图像

    while True:
        # 截取屏幕画面
        screen = np.array(pyautogui.screenshot())
        screen_gray = cv2.cvtColor(screen, cv2.COLOR_BGR2GRAY)

        # 使用模板匹配
        result = cv2.matchTemplate(screen_gray, target_img, cv2.TM_CCOEFF_NORMED)
        min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)

        # 如果匹配度足够高，则保存完整的屏幕截图并标注目标位置，然后退出程序
        threshold = 0.9 # 设置匹配阈值
        if max_val > threshold:
            # target_width, target_height = target_img.shape[::-1]
            top_left = max_loc
            # bottom_right = (top_left[0] + target_width, top_left[1] + target_height)

            # 在屏幕截图上标记目标区域
            # result_screen = screen.copy()
            # cv2.rectangle(result_screen, top_left, bottom_right, (0, 255, 0), 2)

            # # 保存完整的屏幕截图
            # cv2.imwrite('C:/Users/asus/Desktop/screen_with_target.jpg', result_screen)
            # print(top_left)
            # print(top_left)
            print(True)
            break

    # 清理
    # cv2.destroyAllWindows()

if __name__ == "__main__":
    target_img_path = sys.argv[1]
    # target_img_path = 'C:/Users/sc/Desktop/chiXueYanJin_1.jpg'
    findTarget(target_img_path)
