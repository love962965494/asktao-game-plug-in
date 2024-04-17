import cv2
import numpy as np
from collections import Counter
import sys

def rgb_to_hex(rgb_color):
    # 将RGB颜色转换为十六进制字符串
    return "#{:02x}{:02x}{:02x}".format(int(rgb_color[0]), int(rgb_color[1]), int(rgb_color[2]))

def find_top_frequent_colors(image_path, top_n=3):
    # 读取图片并转换颜色空间从BGR到RGB
    image = cv2.imread(image_path)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # 将图片数据转换为一维数组，每个像素是一个RGB颜色值
    pixels = image.reshape((-1, 3))
    
    # 可选步骤：简化颜色，将颜色值四舍五入到最近的10，以减少总颜色数
    simplified_pixels = np.round(pixels / 10) * 10
    simplified_pixels = np.clip(simplified_pixels, 0, 255)  # 确保颜色值在有效范围内

    # 将颜色转换为整数元组，以便可以使用Counter进行计数
    pixel_colors = [tuple(pixel) for pixel in simplified_pixels.astype(int)]

    # 计算最常见的颜色
    most_common_colors = Counter(pixel_colors).most_common(top_n)

    # 转换颜色为十六进制格式并返回
    top_colors_hex = [rgb_to_hex(color[0]) for color in most_common_colors]

    return top_colors_hex

# 使用函数
if __name__ == "__main__":
    image_path = sys.argv[1]  # 更改为你的图片路径
    top_n = int(sys.argv[2])
    # image_path = 'C:/Users/96296/Desktop/talkToNPC_3.jpg'  # 更改为你的图片路径
    # top_n = 20
    top_colors_hex = find_top_frequent_colors(image_path, top_n)
    print(top_colors_hex)

