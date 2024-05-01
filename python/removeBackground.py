import cv2
import numpy as np
import sys

def remove_background(image, threshold):
    # 将图像转换为灰度
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # 应用阈值处理来创建二值图像
    _, binary = cv2.threshold(gray, threshold, 255, cv2.THRESH_BINARY)
    
    # 执行形态学操作以填充空洞
    kernel = np.ones((5, 5), np.uint8)
    closing = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
    
    # 找到图像中的轮廓
    contours, _ = cv2.findContours(closing, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # 创建与原始图像相同大小的掩码
    mask = np.zeros_like(image)
    
    # 将图像中的轮廓绘制到掩码上
    cv2.drawContours(mask, contours, -1, (255, 255, 255), thickness=cv2.FILLED)
    
    # 通过与掩码相乘来移除背景
    result = cv2.bitwise_and(image, mask)
    
    return result


if __name__ == "__main__":
    image_path = sys.argv[1]
    output_image_path = sys.argv[1]
    # image_path = 'C:/Users/sc/Desktop/123.png'
    # output_image_path= 'C:/Users/sc/Desktop/456.png'
    threshold_value = 80  # 设置阈值

    # 读取图像
    image = cv2.imread(image_path)

    # 去除背景
    result_image = remove_background(image, threshold_value)

    cv2.imwrite(output_image_path, result_image)
