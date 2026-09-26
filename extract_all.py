import cv2
import easyocr
import json
import re

reader = easyocr.Reader(['en'], gpu=False)

# Page classification:
# Large right: pages 3, 4, 5, 9, 11, 13, 15, 18, 19
# Large left: pages 6, 14, 20, 24
# Compact left+right (24 doors): pages 7, 8, 10, 12, 16, 17, 21, 22
# Compact right (12 doors): page 23

large_right_cols = [1459, 1889, 2319]
large_left_cols = [72, 501, 931]
large_rows = [252, 1125]
large_w, large_h = 387, 806

compact_left_cols = [82, 401, 721, 1041]
compact_right_cols = [1469, 1789, 2109, 2429]
compact_rows = [171, 775, 1378]
compact_w, compact_h = 267, 557

page_configs = {
    3:  {'type': 'large_right', 'collection': 'Marble Membrane Door'},
    4:  {'type': 'large_right', 'collection': 'UV Membrane Door'},
    5:  {'type': 'large_right', 'collection': 'UV Membrane Door'},
    6:  {'type': 'large_left',  'collection': 'UV Membrane Door'},
    7:  {'type': 'compact_both', 'collection': 'UV Membrane Door'},
    8:  {'type': 'compact_both', 'collection': 'UV Membrane Door'},
    9:  {'type': 'large_right', 'collection': 'Mica Door'},
    10: {'type': 'compact_both', 'collection': 'Mica Door'},
    11: {'type': 'large_right', 'collection': 'Steel Patti Door'},
    12: {'type': 'compact_both', 'collection': 'Steel Patti Door'},
    13: {'type': 'large_right', 'collection': 'Plain Membrane Door'},
    14: {'type': 'large_left',  'collection': 'Plain Membrane Door'},
    15: {'type': 'large_right', 'collection': 'Plain Membrane Door'},
    16: {'type': 'compact_both', 'collection': 'Plain Membrane Door'},
    17: {'type': 'compact_both', 'collection': 'Kumil Membrane Door'},
    18: {'type': 'large_right', 'collection': '3D Membrane Door'},
    19: {'type': 'large_right', 'collection': 'Micro Coating Door'},
    20: {'type': 'large_left',  'collection': 'Micro Coating Door'},
    21: {'type': 'compact_both', 'collection': 'Micro Coating Door'},
    22: {'type': 'compact_both', 'collection': 'Micro Coating Door'},
    23: {'type': 'compact_right', 'collection': 'WPVC Digital Door'},
    24: {'type': 'large_left',  'collection': 'Rubber Wood Door'},
}

def clean_ocr(text):
    # Remove junk characters, keep letters and digits
    text = re.sub(r'[^A-Za-z0-9\- ]', '', text).strip()
    return text

print("Page configuration mapping defined.")
