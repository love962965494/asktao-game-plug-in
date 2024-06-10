import cv2
import numpy as np
import sys

# 是否可以从图片里找到指定图片
def find_template_in_image(big_image_path, small_image_path, threshold=0.8):
    # 读取大图像（搜索图像）和小图像（模板），0 表示以灰度模式读取
    img = cv2.imread(big_image_path, 0)
    template = cv2.imread(small_image_path, 0)

    # 执行模板匹配
    res = cv2.matchTemplate(img, template, cv2.TM_CCOEFF_NORMED)

    # 检查是否存在大于等于阈值的匹配结果
    if np.any(res >= threshold):
        return True  # 找到至少一个匹配
    else:
        return False  # 没有找到匹配

# 示例使用
    
if __name__ == "__main__":
    big_image_path = sys.argv[1]
    small_image_path = sys.argv[2]
    threshold = float(sys.argv[3])
    # big_image_path = 'C:/Users/sc/Desktop/loginGame_1.jpg'
    # small_image_path = 'C:/Users/sc/Desktop/loginFailed.jpg'
    # threshold = 0.8
    # small_image_path = 'C:/Users/asus/Desktop/Key_WangCai.jpg'
    # small_image_path = 'C:/Users/asus/Desktop/zhuanQuan.jpg'
    # small_image_path = 'C:/Users/asus/Desktop/pinTu.jpg'
    found = find_template_in_image(big_image_path, small_image_path, threshold)
    print(found)