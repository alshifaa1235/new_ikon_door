import cv2
import easyocr
import json

reader = easyocr.Reader(['en'], gpu=False)

# Test pages 3, 4, 9, 11, 13, 17, 18, 19, 23, 24
# Large door right: cols=[1459, 1889, 2319], rows=[252, 1125], w=387, h=806
# Large door left: cols=[72, 501, 931], rows=[252, 1125], w=387, h=806

def test_labels(pno, cols, rows, w, h):
    fn = f'extracted_catalogue/page_{pno:02d}.jpg'
    page = cv2.imread(fn)
    print(f'=== Page {pno:02d} ===')
    idx = 1
    for r_idx, y in enumerate(rows):
        for c_idx, x in enumerate(cols):
            # Label is below the door: y+h to y+h+60
            lbl = page[y+h:y+h+70, x:x+w]
            res = reader.readtext(lbl)
            text = ' '.join([r[1] for r in res])
            print(f'  Door {idx} (row {r_idx+1}, col {c_idx+1}): "{text}"')
            idx += 1

print("--- Testing Page 3 (Marble) ---")
test_labels(3, [1459, 1889, 2319], [252, 1125], 387, 806)

print("--- Testing Page 4 (UV) ---")
test_labels(4, [1459, 1889, 2319], [252, 1125], 387, 806)

print("--- Testing Page 11 (Steel Patti) ---")
test_labels(11, [1459, 1889, 2319], [252, 1124], 387, 806)
