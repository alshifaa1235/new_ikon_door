import cv2
import easyocr
import re
import json
import os

reader = easyocr.Reader(['en'], gpu=False)

def read_label(page, x, y, w, h, is_compact=False):
    # For large doors: label is y+h to y+h+65, x-10 to x+w+10
    # For compact doors: label is y+h to y+h+50, x-10 to x+w+10
    lbl_h = 50 if is_compact else 65
    lbl = page[y+h:y+h+lbl_h, max(0, x-10):min(page.shape[1], x+w+10)]
    res = reader.readtext(lbl)
    text = ' '.join([r[1] for r in res])
    # Extract code
    text = text.upper().strip()
    return text

print("OCR helper ready.")
