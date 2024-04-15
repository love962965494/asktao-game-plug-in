import cv2
import sys
import json

def find_most_similar_image(template_path, image_paths):
    # 读取模板图片
    template_image = cv2.imread(template_path)

    # 存储每张待匹配图片与模板图片的相似度
    similarities = {}
    # 遍历每张待匹配的图片
    for image_path in image_paths:
        # 读取待匹配图片
        image = cv2.imread(image_path)
        result = cv2.matchTemplate(image, template_image, cv2.TM_CCOEFF_NORMED)

        # 获取匹配结果的最大值位置
        _, max_val, _, max_loc = cv2.minMaxLoc(result)
        similarities[image_path] = max_val

    return similarities

# 示例用法
# template_path = 'C:/Users/asus/Desktop/Key_WangWang.jpg'  # 模板图片路径
# image_paths = [
#     'C:/Users/asus/Desktop/Key_WangWang.jpg',
#     'C:/Users/asus/Desktop/Key_WangFu.jpg',
#     'C:/Users/asus/Desktop/Key_WangCai.jpg',
#     'C:/Users/asus/Desktop/Key_WangQi.jpg',
#     'C:/Users/asus/Desktop/Key_WangMei.jpg',
# ]  # 待匹配图片路径列表

# similarities = find_most_similar_image(template_path, image_paths)
# print("Most similar image:", similarities)

if __name__ == "__main__":
    template_path = sys.argv[1]  # 模板图片路径
    image_paths = sys.argv[2].split(',')  # 待匹配图片
    similarities = find_most_similar_image(template_path, image_paths)
    print(json.dumps(similarities))

