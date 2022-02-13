import sys
import cv2 as cv
import numpy as np
from platformdirs import os

img = None
templ = None
image_window = "Source Image"
result_window = "Result window"
match_method = 5
max_Trackbar = 5

def cv_imread(file_path):
    cv_img = cv.imdecode(np.fromfile(file_path, dtype=np.uint8), -1)
    cv_img=cv.cvtColor(cv_img, cv.COLOR_RGB2GRAY)
    return cv_img

def main():
    global img
    global templ
    src_path = os.path.join(os.getcwd() + '\python\images\screenCapture.jpg')
    obj_path = os.path.join(os.getcwd() + '\python\images\GUIElements\gameLogo_100.png')
    img = cv_imread(src_path)
    templ = cv_imread(obj_path)
    if ((img is None) or (templ is None)):
        print('Can\'t read one of the images')
        return -1
    
    cv.namedWindow( image_window, cv.WINDOW_FREERATIO )
    cv.namedWindow( result_window, cv.WINDOW_FREERATIO )
    
    trackbar_label = 'Method: \n 0: SQDIFF \n 1: SQDIFF NORMED \n 2: TM CCORR \n 3: TM CCORR NORMED \n 4: TM COEFF \n 5: TM COEFF NORMED'
    cv.createTrackbar( trackbar_label, image_window, match_method, max_Trackbar, MatchingMethod )
    
    MatchingMethod(match_method)
    
    cv.waitKey(0)
    return 0
    
def MatchingMethod(param):
    global match_method
    match_method = param
    
    img_display = img.copy()
    
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
            cv.rectangle(img_display, point, (point[0] + templ.shape[0], point[1] + templ.shape[1]), (0,0,0), 2, 8, 0 )
            cv.rectangle(result, point, (point[0] + templ.shape[0], point[1] + templ.shape[1]), (0,0,0), 2, 8, 0 )
            cv.imshow(image_window, img_display)
            cv.imshow(result_window, result)
            rectangleArr.append([nowX, nowY])
    pass

if __name__ == "__main__":
    main()