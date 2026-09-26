import os
import shutil

src_root = r"C:\Users\navee\.gemini\antigravity-ide\scratch\new-ikon-doors"
public_dir = os.path.join(src_root, "public")
doors_dir = os.path.join(public_dir, "doors")
cat_pages_dir = os.path.join(public_dir, "catalogue_pages")
pdf_dest_dir = os.path.join(public_dir, "catalogue")

os.makedirs(doors_dir, exist_ok=True)
os.makedirs(cat_pages_dir, exist_ok=True)
os.makedirs(pdf_dest_dir, exist_ok=True)

# 1. Copy original PDF
orig_pdf = r"C:\Users\navee\Downloads\NEW IKON DOORS_compressed.pdf"
dest_pdf = os.path.join(pdf_dest_dir, "NEW_IKON_DOORS.pdf")
if os.path.exists(orig_pdf):
    shutil.copy2(orig_pdf, dest_pdf)
    print(f"Copied PDF: {os.path.getsize(dest_pdf)} bytes")
else:
    print(f"WARNING: {orig_pdf} not found")

# 2. Copy door products and lifestyle images
prod_src = os.path.join(src_root, "extracted_catalogue", "products")
for f in os.listdir(prod_src):
    sp = os.path.join(prod_src, f)
    dp = os.path.join(doors_dir, f)
    if os.path.isfile(sp):
        shutil.copy2(sp, dp)

print(f"Copied {len(os.listdir(doors_dir))} door and lifestyle assets to public/doors")

# 3. Copy full 24 catalogue pages for flipbook/preview
cat_src = os.path.join(src_root, "extracted_catalogue")
for i in range(1, 25):
    fn = f"page_{i:02d}.jpg"
    sp = os.path.join(cat_src, fn)
    dp = os.path.join(cat_pages_dir, fn)
    if os.path.isfile(sp):
        shutil.copy2(sp, dp)

print(f"Copied {len(os.listdir(cat_pages_dir))} catalogue pages to public/catalogue_pages")
