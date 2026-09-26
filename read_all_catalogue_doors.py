import cv2
import easyocr
import re
import json

reader = easyocr.Reader(['en'], gpu=False)

def clean_code(text, default_prefix, num):
    # Try to extract letters and numbers
    text = text.upper().strip()
    m = re.search(r'([A-Z0-9]{1,5})\s*[-_]?\s*([0-9]{2,5})', text)
    if m:
        return f"{m.group(1)} - {m.group(2)}"
    # Fallback to pure digits
    m_num = re.search(r'([0-9]{3,5})', text)
    if m_num:
        return f"{default_prefix} - {m_num.group(1)}"
    return f"{default_prefix} - {num:02d}"

print("Script template ready.")
