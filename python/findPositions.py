import sys
import cv2 as cv
import numpy as np

img = None
templ = None
image_window = "Source Image"
result_window = "Result window"
max_Trackbar = 5

def cv_imread(file_path):
    cv_img = cv.imdecode(np.fromfile(file_path, dtype=np.uint8), -1)
    cv_img=cv.cvtColor(cv_img, cv.COLOR_RGB2BGR)
    return cv_img

def main(argv):
    global img
    global templ
    src_path, obj_path, match_method = argv
    img = cv_imread(src_path)
    templ = cv_imread(obj_path)
    if ((img is None) or (templ is None)):
        print('Can\'t read one of the images')
        return -1
    
    MatchingMethod(int(match_method))
    
    cv.waitKey(0)
    return 0
    
def MatchingMethod(param):
    global match_method
    match_method = param
    
    result = cv.matchTemplate(img, templ, match_method)
    
    cv.normalize( result, result, 0, 1, cv.NORM_MINMAX, -1 )
    
    if (match_method == cv.TM_SQDIFF or match_method == cv.TM_SQDIFF_NORMED):
        loc = np.where(result < 0.05)
    else:
        loc = np.where(result > 0.95)

    width = templ.shape[0]
    height = templ.shape[1]
    rectangleArr = []
    for point in zip(*loc[::-1]):
        nowX, nowY = point
        hasRectangled = False
        for item in rectangleArr:
            x , y = item
            flag1 = x >= nowX and nowX + width >= x or (x <= nowX and x + width >= nowX)
            flag2 = y >= nowY and nowY + height >= y or (y <= nowY and y + height >= nowY)
            
            if (flag1 and flag2):
                hasRectangled = True
                break
        
        if (not hasRectangled):
            rectangleArr.append([nowX, nowY])

        print(rectangleArr)
    pass

if __name__ == "__main__":
    main(sys.argv[1:])