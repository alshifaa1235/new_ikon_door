import cv2
import easyocr

reader = easyocr.Reader(['en'], gpu=False)
page = cv2.imread('extracted_catalogue/page_23.jpg')

cols = [1469, 1789, 2109, 2429]
rows = [171, 775, 1378]
w, h = 267, 557

door_idx = 1
for r_idx, y in enumerate(rows):
    for c_idx, x in enumerate(cols):
        lbl_crop = page[y+h:y+h+50, x-10:x+w+10]
        res = reader.readtext(lbl_crop)
        text = ' '.join([r[1] for r in res])
        print(f'Door {door_idx} (row {r_idx+1}, col {c_idx+1}): OCR = "{text}"')
        door_idx += 1
