import cv2
import numpy as np
import sys

# 判断两张图片是否相同
def find_template_in_image(large_image_path, template_image_path):
    # 读取大图像
    img_rgb = cv2.imread(large_image_path)
    # 读取模板图像
    template = cv2.imread(template_image_path)
    w, h = template.shape[:-1][::-1]  # 获取模板图像的宽和高

    # 将图像转换到灰度
    img_gray = cv2.cvtColor(img_rgb, cv2.COLOR_BGR2GRAY)
    template_gray = cv2.cvtColor(template, cv2.COLOR_BGR2GRAY)

    # 模板匹配
    res = cv2.matchTemplate(img_gray, template_gray, cv2.TM_CCOEFF_NORMED)
    
    # 设定阈值
    threshold = [0.8, 0.98]
    
    # 如果找到了模板，则返回True以及其他信息
    if np.any((res >= threshold[1]) | (res <= threshold[0])):
        return True
    else:
        return False

if __name__ == "__main__":
    # 调用函数
    large_image_path = sys.argv[1]
    template_image_path = sys.argv[2]
    # large_image_path = 'C:/Users/asus/Desktop/preProcessing_47_1.jpg'
    # template_image_path = 'C:/Users/asus/Desktop/preProcessing_47_2.jpg'
    # image_path = 'C:/Users/asus/Desktop/Team.png'
    found = find_template_in_image(large_image_path, template_image_path)
    print(found)