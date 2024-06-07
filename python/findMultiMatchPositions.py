import cv2
import numpy as np
import sys

def find_matches(large_image_path, small_image_path):
    # 读取大图片和小图片
    large_img = cv2.imread(large_image_path)
    small_img = cv2.imread(small_image_path)

    # 获取小图片的高度和宽度
    h, w = small_img.shape[:2]

    # 使用模板匹配算法
    result = cv2.matchTemplate(large_img, small_img, cv2.TM_CCOEFF_NORMED)

    # 设定阈值，获取匹配结果中高于阈值的部分
    threshold = 0.7
    loc = np.where(result >= threshold)

    # 获取匹配到的左上角坐标信息
    matches = []
    for pt in zip(*loc[::-1]):
        # 检查当前坐标是否与已有的匹配位置过于接近
        too_close = False
        for m in matches:
            if abs(pt[0] - m[0]) < w and abs(pt[1] - m[1]) < h:
                too_close = True
                break
        # 如果不与已有匹配位置接近，则添加到结果中
        if not too_close:
            matches.append([pt[0], pt[1]])

    return matches

if __name__ == "__main__":
    big_image = sys.argv[1]  # 小图路径
    small_image = sys.argv[2]    # 大图路径
    matches = find_matches(big_image, small_image)
    print(matches)