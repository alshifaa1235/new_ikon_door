"""
New Ikon Doors — Built-in Non-Removable Catalogue Watermark Generator
Bakes unremovable brand watermarks and security banners directly into the image pixels
of every page, and sets AES-256 permissions to block tampering and unauthorized editing.
"""

import os
import io
import shutil
import fitz
from PIL import Image, ImageDraw, ImageFont

PDF_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "catalogue")
SRC_PDF = os.path.join(PDF_DIR, "NEW_IKON_DOORS.pdf")
BACKUP_PDF = os.path.join(PDF_DIR, "NEW_IKON_DOORS_original_clean.pdf")
TEMP_PDF = os.path.join(PDF_DIR, "NEW_IKON_DOORS_watermarked_temp.pdf")

def create_stamp():
    try:
        font_large = ImageFont.truetype("arialbd.ttf", 54)
        font_med = ImageFont.truetype("arialbd.ttf", 25)
        font_small = ImageFont.truetype("arialbd.ttf", 19)
    except Exception:
        font_large = font_med = font_small = ImageFont.load_default()

    stamp = Image.new("RGBA", (920, 220), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(stamp)

    large_text = "NEW IKON DOORS"
    sub_text = "OFFICIAL ARCHITECTURAL CATALOGUE"
    phone_text = "PROPERTY OF NEW IKON DOORS - TRICHY: +91 98424 45353"

    # Subtle contrast drop-shadow
    for dx, dy in [(-1, -1), (1, -1), (-1, 1), (1, 1), (0, 2)]:
        sdraw.text((460 + dx, 50 + dy), large_text, fill=(0, 0, 0, 45), font=font_large, anchor="mm")
        sdraw.text((460 + dx, 108 + dy), sub_text, fill=(0, 0, 0, 55), font=font_med, anchor="mm")
        sdraw.text((460 + dx, 148 + dy), phone_text, fill=(0, 0, 0, 55), font=font_small, anchor="mm")

    # Main translucent text
    sdraw.text((460, 50), large_text, fill=(255, 255, 255, 105), font=font_large, anchor="mm")
    sdraw.text((460, 108), sub_text, fill=(255, 255, 255, 115), font=font_med, anchor="mm")
    sdraw.text((460, 148), phone_text, fill=(255, 255, 255, 115), font=font_small, anchor="mm")

    return stamp.rotate(30, expand=True, resample=Image.BICUBIC)

def main():
    print("=" * 65)
    print("  NEW IKON DOORS - NON-DISTURBING WATERMARK PROCESSING")
    print("=" * 65)

    if not os.path.exists(BACKUP_PDF):
        shutil.copyfile(SRC_PDF, BACKUP_PDF)
        print(f"[+] Saved original backup to: {BACKUP_PDF}")

    doc_in = fitz.open(BACKUP_PDF)
    doc_out = fitz.open()

    total_pages = len(doc_in)
    print(f"[*] Processing {total_pages} catalogue pages...")

    try:
        font_margin = ImageFont.truetype("arial.ttf", 14)
        font_gutter = ImageFont.truetype("arial.ttf", 12)
        font_banner = ImageFont.truetype("arialbd.ttf", 18)
    except Exception:
        font_margin = font_gutter = font_banner = ImageFont.load_default()

    for idx in range(total_pages):
        page_in = doc_in[idx]
        p_rect = page_in.rect
        img_list = page_in.get_images()

        if not img_list:
            pix = page_in.get_pixmap(dpi=150)
            im = Image.open(io.BytesIO(pix.tobytes("jpeg"))).convert("RGBA")
        else:
            xref = img_list[0][0]
            img_data = doc_in.extract_image(xref)["image"]
            im = Image.open(io.BytesIO(img_data)).convert("RGBA")

        w, h = im.size
        overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))

        # Color tuning for dark vs light cover
        margin_color = (180, 180, 180, 160) if idx == 0 else (120, 120, 120, 140)

        # 1. Left margin vertical watermark (completely outside door images)
        v_stamp_left = Image.new("RGBA", (h, 25), (0, 0, 0, 0))
        vdraw_left = ImageDraw.Draw(v_stamp_left)
        vdraw_left.text(
            (h // 2, 12),
            "NEW IKON DOORS - TRICHY  *  OFFICIAL ARCHITECTURAL CATALOGUE  *  PHONE: +91 98424 45353",
            fill=margin_color,
            font=font_margin,
            anchor="mm"
        )
        rot_left = v_stamp_left.rotate(90, expand=True, resample=Image.BICUBIC)
        overlay.paste(rot_left, (8, (h - rot_left.size[1]) // 2), rot_left)

        # 2. Right margin vertical watermark (completely outside door images)
        v_stamp_right = Image.new("RGBA", (h, 25), (0, 0, 0, 0))
        vdraw_right = ImageDraw.Draw(v_stamp_right)
        vdraw_right.text(
            (h // 2, 12),
            "PROPRIETARY CATALOGUE OF NEW IKON DOORS  *  UNAUTHORIZED ALTERATION OR RESALE PROHIBITED",
            fill=margin_color,
            font=font_margin,
            anchor="mm"
        )
        rot_right = v_stamp_right.rotate(270, expand=True, resample=Image.BICUBIC)
        overlay.paste(rot_right, (w - rot_right.size[0] - 8, (h - rot_right.size[1]) // 2), rot_right)

        # 3. Center spine/gutter watermark on interior spread pages (between left & right door layouts)
        if 0 < idx < total_pages - 1:
            v_stamp_center = Image.new("RGBA", (h, 20), (0, 0, 0, 0))
            vdraw_center = ImageDraw.Draw(v_stamp_center)
            vdraw_center.text(
                (h // 2, 10),
                "NEW IKON DOORS  *  AUTHENTIC MANUFACTURED DESIGNS  *  TRICHY, TAMIL NADU",
                fill=(140, 140, 140, 120),
                font=font_gutter,
                anchor="mm"
            )
            rot_center = v_stamp_center.rotate(90, expand=True, resample=Image.BICUBIC)
            overlay.paste(rot_center, (int(w * 0.495), (h - rot_center.size[1]) // 2), rot_center)

        # 4. Bottom security & copyright banner (sits neatly at bottom edge, 100% outside door images)
        banner_h = 28
        banner = Image.new("RGBA", (w, banner_h), (24, 24, 24, 230))
        bdraw = ImageDraw.Draw(banner)
        banner_text = (
            "NEW IKON DOORS - TRICHY  |  OFFICIAL CATALOGUE  |  "
            "WHOLESALE & TRADE ENQUIRIES: +91 98424 45353  |  "
            "ALL RIGHTS RESERVED"
        )
        bdraw.text((w // 2, banner_h // 2), banner_text, fill=(225, 195, 145, 240), font=font_banner, anchor="mm")
        overlay.paste(banner, (0, h - banner_h), banner)

        # Composite and bake directly into raster image pixels
        watermarked = Image.alpha_composite(im, overlay).convert("RGB")

        buf = io.BytesIO()
        watermarked.save(buf, format="JPEG", quality=92, optimize=True)
        buf.seek(0)

        page_out = doc_out.new_page(width=p_rect.width, height=p_rect.height)
        page_out.insert_image(p_rect, stream=buf.getvalue())
        print(f"  [OK] Page {idx + 1}/{total_pages} processed.")

    # Set PDF Metadata
    doc_out.set_metadata({
        "title": "New Ikon Doors - Official Catalogue",
        "author": "New Ikon Doors, Trichy",
        "subject": "Architectural Door Elevations and Technical Specifications",
        "keywords": "New Ikon Doors, Doors, Trichy, Tamil Nadu, Official Catalogue",
        "creator": "New Ikon Doors Security Engine"
    })

    # Save with AES-256 permission restrictions (read/print allowed, modifying blocked)
    print("[*] Applying AES-256 permission restrictions (read/print allowed, modifying blocked)...")
    doc_out.save(
        TEMP_PDF,
        encryption=fitz.PDF_ENCRYPT_AES_256,
        owner_pw="NewIkon@DoorsSecurity2026",
        permissions=fitz.PDF_PERM_PRINT | fitz.PDF_PERM_ACCESSIBILITY,
        deflate=True
    )
    doc_out.close()
    doc_in.close()

    # Replace target PDF
    shutil.move(TEMP_PDF, SRC_PDF)
    file_size_mb = os.path.getsize(SRC_PDF) / (1024 * 1024)
    print(f"[+] Successfully watermarked all {total_pages} pages into {SRC_PDF} ({file_size_mb:.2f} MB)")
    print("=" * 65)

if __name__ == "__main__":
    main()
