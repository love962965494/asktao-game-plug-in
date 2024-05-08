# paddle_ocr.py
import sys
from paddleocr import PaddleOCR
import json

# 创建OCR对象，这里可以根据需要配置语言等参数
ocr_ch = PaddleOCR(use_angle_cls=False, 
                lang='ch'
                ) 
ocr_en = PaddleOCR(use_angle_cls=False, 
                lang='en'
                ) 

def ocr_image(image_path, lang = 'ch'):
    # 执行OCR
    result = ocr_ch.ocr(image_path, cls=True) if lang == 'ch' else ocr_en.ocr(image_path, cls=True)
    # 可以按需处理或直接返回结果
    return result

if __name__ == "__main__":
    image_path = sys.argv[1]
    lang = sys.argv[2]
    # image_path = 'C:/Users/asus/Desktop/testScreenCapture_1.jpg'
    # lang = 'ch'
    results = ocr_image(image_path, lang)
    formatRusult = []
    for idx in range(len(results)):
        res = results[idx]
        for line in res:
            formatRusult.append(line[1][0])
    print(json.dumps(formatRusult))