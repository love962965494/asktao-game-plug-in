import cv2
import numpy as np

def find_partial_image(image1_path, image2_path, threshold):
    # 加载图片
    img1 = cv2.imread(image1_path, 0)  # 查询图像，即小图像
    img2 = cv2.imread(image2_path, 0)  # 训练(场景)图像，即大图像

    # 初始化ORB检测器
    orb = cv2.ORB_create()

    # 查找关键点和描述符
    if len(img1.shape) == 3: # 检查是否有三个维度（即宽度、高度和通道数）
        gray_image1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
    else:
        gray_image1 = img1 # 图像已经是灰度图，不需要转换
    if len(img2.shape) == 3: # 检查是否有三个维度（即宽度、高度和通道数）
        gray_image2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)
    else:
        gray_image2 = img2 # 图像已经是灰度图，不需要转换
    kp1, des1 = orb.detectAndCompute(gray_image1, None)
    kp2, des2 = orb.detectAndCompute(gray_image2, None)

    # 检查特征点
    if des1 is None or des2 is None or len(kp1) == 0 or len(kp2) == 0:
        print("至少一个图像中没有找到特征点。")
        return False

    # 创建BFMatcher并进行匹配
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    matches = bf.match(des1, des2)

    # 根据距离排序
    matches = sorted(matches, key=lambda x: x.distance)

    # 计算好的匹配点
    good_matches = [m for m in matches if m.distance < 60]  # 距离阈值可以调整

    # 判断匹配点数量是否满足阈值条件
    if len(good_matches)/len(kp1) > threshold:
        print("找到匹配的部分图像。")
        return True
    else:
        print("没有找到足够的匹配。")
        return False

# 图片路径
image1_path = 'C:/Users/asus/Desktop/talkToNPC1.jpg'  # 小图像路径
image2_path = 'C:/Users/asus/Desktop/talkToNPC2.jpg'  # 大图像路径
    # large_image_path = 'C:/Users/asus/Desktop/testTeamLeader.jpg'
    # template_image_path = 'C:/Users/asus/Desktop/bigTestTeamLeader.jpg'

# 设置匹配阈值
threshold = 0.1  # 好的匹配点占小图像关键点总数的比例阈值

# 检查image1是否是image2的一部分
find_partial_image(image1_path, image2_path, threshold)