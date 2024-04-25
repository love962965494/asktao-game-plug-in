import cv2
import numpy as np
import sys

def find_template(template_path, image_path, threshold=0.7):
    # 加载大图和小图
    large_image = cv2.imread(image_path)
    small_image = cv2.imread(template_path)

    # 获取小图的宽度和高度
    h, w = small_image.shape[:2]

    # 选择匹配方法，这里使用归一化相关性匹配方法
    method = cv2.TM_CCOEFF_NORMED

    # 执行模板匹配
    result = cv2.matchTemplate(large_image, small_image, method)

    # 获取匹配结果的最大值位置
    _, max_val, _, max_loc = cv2.minMaxLoc(result)

    if max_val < threshold:
      return np.array([])

    # 返回左上角坐标
    return [max_loc[0], max_loc[1]]

# 示例用法

if __name__ == "__main__":
  template_path = sys.argv[1]  # 小图路径
  image_path = sys.argv[2]    # 大图路径
  # template_path = 'C:/Users/sc/Desktop/123.png'  # 小图路径
  # image_path = 'C:/Users/sc/Desktop/123_1.png'    # 大图路径

  top_left = find_template(template_path, image_path)
  print(top_left)
