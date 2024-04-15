import cv2
import numpy as np
import sys

def compare_images(img1, img2, threshold):
    # 读取图片
    image1 = cv2.imread(img1)
    image2 = cv2.imread(img2)
    
    # 将图片转换为灰度图像
    gray_image1 = cv2.cvtColor(image1, cv2.COLOR_BGR2GRAY)
    gray_image2 = cv2.cvtColor(image2, cv2.COLOR_BGR2GRAY)
    
    # 计算图像差异
    difference = cv2.absdiff(gray_image1, gray_image2)
    
    # 归一化阈值到0-255之间
    
    # 根据阈值判断是否认为两张图片相同
    meanDifference = np.mean(difference)
    if meanDifference > 0:
        if 0.1 < meanDifference < threshold:
            return [1, meanDifference]
        else:
            return [-1, meanDifference]
    else:
        return [0, meanDifference]

# 示例使用
if __name__ == "__main__":
    image1_path = sys.argv[1]
    image2_path = sys.argv[2]
    threshold_value = int(sys.argv[3])
    # image1_path = 'C:/Users/asus/Desktop/preProcessing_15_1.jpg'
    # image2_path = 'C:/Users/asus/Desktop/preProcessing_15_2.jpg'
    # image2_path = 'C:/Users/asus/Desktop/groupTeam_JiaRu_2.jpg'
    found = compare_images(image1_path, image2_path, threshold_value)
    print(found)

