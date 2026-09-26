import cv2
import numpy as np

def analyze_page(pno):
    fn = f'extracted_catalogue/page_{pno:02d}.jpg'
    page = cv2.imread(fn)
    if page is None:
        return
    H, W = page.shape[:2]
    gray = cv2.cvtColor(page, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    contours, _ = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    
    # Large door candidates: w ~ 350-420, h ~ 750-850
    # Compact door candidates: w ~ 230-300, h ~ 500-600
    large = []
    compact = []
    
    for c in contours:
        x, y, w, h = cv2.boundingRect(c)
        aspect = h / float(w) if w > 0 else 0
        if 1.8 < aspect < 2.5:
            if 340 < w < 440 and 720 < h < 870:
                large.append((x, y, w, h))
            elif 230 < w < 300 and 500 < h < 610:
                compact.append((x, y, w, h))
                
    def dedupe(box_list):
        res = []
        for b in sorted(box_list, key=lambda x: x[2]*x[3], reverse=True):
            x, y, w, h = b
            overlap = False
            for fx, fy, fw, fh in res:
                ix = max(x, fx); iy = max(y, fy)
                iw = min(x+w, fx+fw) - ix; ih = min(y+h, fy+fh) - iy
                if iw > 0 and ih > 0 and (iw*ih)/(w*h) > 0.4:
                    overlap = True; break
            if not overlap:
                res.append(b)
        return sorted(res, key=lambda b: (b[1]//150, b[0]))
        
    large_d = dedupe(large)
    compact_d = dedupe(compact)
    
    print(f'Page {pno:02d}: large={len(large_d)}, compact={len(compact_d)}')
    if len(large_d) >= 6:
        print(f'   -> Type: LARGE ({len(large_d)} doors)')
        for i, b in enumerate(large_d[:6]):
            print(f'      {i+1}: x={b[0]}, y={b[1]}, w={b[2]}, h={b[3]}')
    elif len(compact_d) >= 12:
        print(f'   -> Type: COMPACT ({len(compact_d)} doors)')
        for i, b in enumerate(compact_d[:12]):
            print(f'      {i+1}: x={b[0]}, y={b[1]}, w={b[2]}, h={b[3]}')
    else:
        print(f'   -> Other: large={len(large_d)}, compact={len(compact_d)}')

for p in range(3, 25):
    analyze_page(p)
