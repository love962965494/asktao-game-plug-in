import numpy as np
from ctypes import *
import cv2 as cv
import os

def cv_imread(file_path):
    cv_img = cv.imdecode(np.fromfile(file_path, dtype=np.uint8), -1)
    return cv_img

def find_image_cv(obj_path, src_path):
    source = cv_imread(src_path)
    template = cv_imread(obj_path)
    result = cv.matchTemplate(source, template, cv.TM_CCOEFF_NORMED)
    pos_start = cv.minMaxLoc(result)[3]
    x = int(pos_start[0]) + int(template.shape[1] / 2)
    y = int(pos_start[1]) + int(template.shape[0] / 2)
    similarity = cv.minMaxLoc(result)[1]
    if similarity < 0.85:
        return []
    else:
        return [x, y]

def main():
    #找到并双击
    src_path = os.path.join(os.getcwd() + '\python\images\desktop.jpg')
    obj_path = os.path.join(os.getcwd() + '\python\images\computer.jpg')

    print(find_image_cv(obj_path, src_path))

if __name__ == "__main__":
    main()