import cv2
import numpy as np
import pyautogui
import sys

def preprocess_image(image):
    # 转换为灰度图像
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # 直方图均衡化
    equalized_image = cv2.equalizeHist(gray_image)
    return equalized_image
# 读取目标图像
def findTarget(target_img_path):
    target_img = cv2.imread(target_img_path, cv2.IMREAD_GRAYSCALE)  # 以灰度模式读取目标图像
    target_img = cv2.equalizeHist(target_img)

    while True:
        # 截取屏幕画面
        screen = np.array(pyautogui.screenshot())
        screen_gray = cv2.cvtColor(screen, cv2.COLOR_BGR2GRAY)

        # 对屏幕截图进行预处理
        screen_gray = preprocess_image(screen)

        # 缩小屏幕图像的大小以提高匹配速度
        # scale_factor = 0.5
        # screen_gray_resized = cv2.resize(screen_gray, (0, 0), fx=scale_factor, fy=scale_factor)

        # 使用模板匹配
        result = cv2.matchTemplate(screen_gray, target_img, cv2.TM_CCOEFF_NORMED)
        min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)

        threshold = 0.8 # 设置匹配阈值
        if max_val > threshold:
            print(True)
            break

if __name__ == "__main__":
    target_img_path = sys.argv[1]
    # target_img_path = 'C:/Users/sc/Desktop/chiXueYanJin.jpg'
    findTarget(target_img_path)
