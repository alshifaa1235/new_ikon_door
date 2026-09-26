import cv2
import easyocr
import re
import json
import os
import shutil

reader = easyocr.Reader(['en'], gpu=False)

src_root = r"C:\Users\navee\.gemini\antigravity-ide\scratch\new-ikon-doors"
public_doors = os.path.join(src_root, "public", "doors")
cat_doors = os.path.join(src_root, "extracted_catalogue", "products")
os.makedirs(public_doors, exist_ok=True)
os.makedirs(cat_doors, exist_ok=True)

# Define collection metadata & page mappings
collections_meta = {
    "Marble Membrane Door": {
        "slug": "marble-membrane",
        "category": "Luxury Marble Finish",
        "description": "Exquisite Italian and Spanish marble veining combined with durable vacuum membrane fusion. Features high-definition stone textures accentuated with golden radial geometry.",
        "material": "High-Density Moisture-Resistant Core + Imported Marble-Grain PVC Membrane",
        "finish": "Gloss / Matte Velvet Stone Texture with Gold Accent inlays",
        "thickness": "30mm / 32mm / 35mm",
        "application": "Living Room, Master Bed, Executive Cabin, Villa Main Internal",
        "tagline": "The Majesty of Natural Stone with Timber Warmth",
        "hero_image": "lifestyle_page_03.jpg",
        "default_prefix": "MG"
    },
    "UV Membrane Door": {
        "slug": "uv-membrane",
        "category": "Ultra-Violet High Gloss Finish",
        "description": "Super-glossy UV protective coating over calibrated engineered panels. Unrivaled scratch resistance and mirror-like reflection designed for modern contemporary homes.",
        "material": "Kiln-Seasoned Hardwood Core + Multi-Layer UV Curable Resin + Membrane",
        "finish": "Ultra High-Gloss UV Shield / Mirror Polish",
        "thickness": "30mm / 32mm / 35mm / 38mm",
        "application": "Bedroom, Apartment Interior, Luxury Suite, Modern Villas",
        "tagline": "Dazzling Reflections That Illuminate Your Living Spaces",
        "hero_image": "lifestyle_page_04.jpg",
        "default_prefix": "UV"
    },
    "Mica Door": {
        "slug": "mica-doors",
        "category": "Architectural Laminate",
        "description": "Heavy-duty 1mm decorative laminates pressed with thermal waterproof adhesives. Delivers authentic timber tactile grain and resilient resistance to wear, heat, and impacts.",
        "material": "Solid Core Blockboard / Flush Core + 1.0mm Premium Mica Laminate",
        "finish": "Natural Woodgrain Embossed / Matte Texture",
        "thickness": "32mm / 35mm / 38mm",
        "application": "High-traffic Passages, Commercial Offices, Hospitality, Master Bedrooms",
        "tagline": "Rugged Durability Meets Timeless Woodcraft",
        "hero_image": "lifestyle_page_09.jpg",
        "default_prefix": "MD"
    },
    "Steel Patti Door": {
        "slug": "steel-patti",
        "category": "Metallic Inlay Architecture",
        "description": "Architectural precision grooved stainless steel patti inlays integrated into rich walnut and charcoal wood membranes. Clean minimalist horizontal and vertical lines.",
        "material": "Moisture-Proof Engineered Composite + Brushed Stainless Steel (SS304) Inlays",
        "finish": "Brushed Chrome / Titanium Metallic Inlay with Silk Wood Finish",
        "thickness": "32mm / 35mm / 38mm",
        "application": "Contemporary Living, Main Entrances, Luxury Suites, Executive Offices",
        "tagline": "Modern Geometric Splendor Defined by Steel",
        "hero_image": "lifestyle_page_11.jpg",
        "default_prefix": "SS"
    },
    "Plain Membrane Door": {
        "slug": "plain-membrane",
        "category": "Subtle Geometric CNC Craft",
        "description": "Pure minimalist CNC routed grooves paired with warm monolithic earth tones. Clean, uncluttered, and adaptable to minimalist interior architectural aesthetics.",
        "material": "Heavy-Density Fiber Core + Seamless German Membrane Vacuum Press",
        "finish": "Satin Velvet Monolith / Fine Grain Matte",
        "thickness": "30mm / 32mm / 35mm",
        "application": "Bedrooms, Study Rooms, Hospital Suites, Commercial Developments",
        "tagline": "Understated Elegance in Every Precision Groove",
        "hero_image": "lifestyle_page_13.jpg",
        "default_prefix": "MM"
    },
    "Kumil Membrane Door": {
        "slug": "kumil-membrane",
        "category": "Heritage South Indian Craft",
        "description": "Traditional South Indian artistic Kumil motifs translated into modern vacuum-sealed membrane doors. Deep carved heritage panels with lasting moisture resistance.",
        "material": "Select Solid Core Timber + Deep CNC Carving + Heat-bonded Membrane",
        "finish": "Warm Teak & Rosewood Heritage Stain Finish",
        "thickness": "32mm / 35mm / 38mm",
        "application": "Puja Room, Traditional Entrances, Heritage Homes, Villas",
        "tagline": "Sacred Traditional Motifs Reimagined for Modern Homes",
        "hero_image": "lifestyle_page_17.jpg",
        "default_prefix": "MK"
    },
    "3D Membrane Door": {
        "slug": "3d-membrane",
        "category": "Dimensional Sculpted Panels",
        "description": "Multi-dimensional CNC carved relief patterns that cast subtle dynamic shadows under interior lighting. Creates dramatic sculptural presence across doorways.",
        "material": "Calibrated Solid Core + Multi-axis 3D CNC Routing + Seamless Membrane",
        "finish": "3D Shadow Relief / Deep Matte Polymer",
        "thickness": "32mm / 35mm / 40mm",
        "application": "Feature Doors, Home Theatres, Main Hall Entrances, Designer Penthouses",
        "tagline": "Sculptural Depth That Transforms Flat Walls into Art",
        "hero_image": "lifestyle_page_18.jpg",
        "default_prefix": "TD"
    },
    "Micro Coating Door": {
        "slug": "micro-coating",
        "category": "Advanced Nano-Polymer Finish",
        "description": "State-of-the-art micro-polymeric surface seal that repels smudges, dust, and water splashes while delivering a hyper-smooth velvet soft-touch experience.",
        "material": "Hydraulic Pressed Composite Core + Nano-Micro Polymeric Seal",
        "finish": "Ultra-Matte Velvet Soft-Touch / Zero-Smudge Texture",
        "thickness": "30mm / 32mm / 35mm",
        "application": "Luxury Apartments, Modern Condos, Bathrooms & Ensuites, Bedrooms",
        "tagline": "The Future of Velvet Touch Micro-Engineered Finishes",
        "hero_image": "lifestyle_page_19.jpg",
        "default_prefix": "LD"
    },
    "WPVC Digital Door": {
        "slug": "wpvc-digital",
        "category": "100% Waterproof Composite",
        "description": "Wood-Plastic Polymer Composite engineered for zero water absorption, zero warping, and 100% termite proofing. Features vibrant high-resolution UV digital graphics.",
        "material": "100% WPVC Solid Synthetic Polymer Composite Core",
        "finish": "High-Definition Digital Print with Protective Clear Coat",
        "thickness": "30mm / 32mm",
        "application": "Bathrooms, Restrooms, Coastal Properties, High-Moisture Utility Balconies",
        "tagline": "100% Waterproof & Termite-Proof for Wet & Exterior Zones",
        "hero_image": "lifestyle_page_23.jpg",
        "default_prefix": "WD"
    },
    "Rubber Wood Door": {
        "slug": "rubber-wood",
        "category": "Sustainable Solid Hardwood",
        "description": "Ecologically sustainable finger-jointed treated solid rubberwood. Kiln-dried to 10% moisture content for unmatched dimensional stability and warm organic grain.",
        "material": "100% Solid Kiln-Dried Chemically Treated Plantation Rubberwood",
        "finish": "Natural Satin Lacquer / Honey Timber Stain",
        "thickness": "32mm / 35mm / 38mm",
        "application": "Eco-Luxury Residences, Bedrooms, Balcony Entrances, Resort Suites",
        "tagline": "Natural Warmth and Strength from Sustainable Timber",
        "hero_image": "lifestyle_page_24.jpg",
        "default_prefix": "RW"
    }
}

# Mapping pages to layout config and collection
page_plans = [
    # Page 3: Marble (6 large right)
    {'page': 3, 'col': 'Marble Membrane Door', 'type': 'large_right'},
    # Page 4: UV (6 large right)
    {'page': 4, 'col': 'UV Membrane Door', 'type': 'large_right'},
    # Page 5: UV (6 large right)
    {'page': 5, 'col': 'UV Membrane Door', 'type': 'large_right'},
    # Page 6: UV (6 large left)
    {'page': 6, 'col': 'UV Membrane Door', 'type': 'large_left'},
    # Page 7: UV (compact both) - extract right 12 for variety
    {'page': 7, 'col': 'UV Membrane Door', 'type': 'compact_right'},
    # Page 8: UV (compact both) - extract left 12 for variety
    {'page': 8, 'col': 'UV Membrane Door', 'type': 'compact_left'},
    # Page 9: Mica (6 large right)
    {'page': 9, 'col': 'Mica Door', 'type': 'large_right'},
    # Page 10: Mica (compact both) - extract left 12
    {'page': 10, 'col': 'Mica Door', 'type': 'compact_left'},
    # Page 11: Steel Patti (6 large right)
    {'page': 11, 'col': 'Steel Patti Door', 'type': 'large_right'},
    # Page 12: Steel Patti (compact both) - extract left 12
    {'page': 12, 'col': 'Steel Patti Door', 'type': 'compact_left'},
    # Page 13: Plain Membrane (6 large right)
    {'page': 13, 'col': 'Plain Membrane Door', 'type': 'large_right'},
    # Page 14: Plain Membrane (6 large left)
    {'page': 14, 'col': 'Plain Membrane Door', 'type': 'large_left'},
    # Page 15: Plain Membrane (6 large right)
    {'page': 15, 'col': 'Plain Membrane Door', 'type': 'large_right'},
    # Page 16: Plain Membrane (compact both) - extract left 12
    {'page': 16, 'col': 'Plain Membrane Door', 'type': 'compact_left'},
    # Page 17: Kumil (compact both) - extract right 12
    {'page': 17, 'col': 'Kumil Membrane Door', 'type': 'compact_right'},
    # Page 18: 3D Membrane (6 large right)
    {'page': 18, 'col': '3D Membrane Door', 'type': 'large_right'},
    # Page 19: Micro Coating (6 large right)
    {'page': 19, 'col': 'Micro Coating Door', 'type': 'large_right'},
    # Page 20: Micro Coating (6 large left)
    {'page': 20, 'col': 'Micro Coating Door', 'type': 'large_left'},
    # Page 21: Micro Coating (compact both) - extract left 12
    {'page': 21, 'col': 'Micro Coating Door', 'type': 'compact_left'},
    # Page 22: Micro Coating (compact both) - extract right 12
    {'page': 22, 'col': 'Micro Coating Door', 'type': 'compact_right'},
    # Page 23: WPVC Digital (compact right 12)
    {'page': 23, 'col': 'WPVC Digital Door', 'type': 'compact_right'},
    # Page 24: Rubber Wood (6 large left)
    {'page': 24, 'col': 'Rubber Wood Door', 'type': 'large_left'},
]

def parse_code(ocr_text, default_prefix, default_num):
    # Search for patterns like "WD 1057", "MG 01", "UV 101", "SS 401"
    text = ocr_text.upper().strip()
    m = re.search(r'([A-Z]{1,4})\s*[-_]?\s*([0-9]{1,4})', text)
    if m:
        pref = m.group(1)
        num = m.group(2)
        # Normalize prefix if OCR confused letters
        if default_prefix == 'WD' and pref in ['D', 'MD', 'WO', 'HD']:
            pref = 'WD'
        elif default_prefix == 'MG' and pref in ['MC', 'MO', 'HG']:
            pref = 'MG'
        elif default_prefix == 'UV' and pref in ['UY', 'UW', 'V']:
            pref = 'UV'
        elif default_prefix == 'SS' and pref in ['S', '55', '5S']:
            pref = 'SS'
        elif default_prefix == 'MM' and pref in ['M', 'NM', 'HM']:
            pref = 'MM'
        elif default_prefix == 'MK' and pref in ['K', 'HK', 'NK']:
            pref = 'MK'
        elif default_prefix == 'TD' and pref in ['T', 'TO', '3D']:
            pref = 'TD'
        elif default_prefix == 'LD' and pref in ['L', 'LO', '1D']:
            pref = 'LD'
        elif default_prefix == 'RW' and pref in ['R', 'RN', 'PW']:
            pref = 'RW'
        return f"{pref} - {num}"
    
    # Check for number only
    m_num = re.search(r'([0-9]{2,4})', text)
    if m_num:
        return f"{default_prefix} - {m_num.group(1)}"
        
    return f"{default_prefix} - {default_num:02d}"

all_products = []
collections_dict = {k: {**v, "name": k, "products": []} for k, v in collections_meta.items()}

for plan in page_plans:
    pno = plan['page']
    cname = plan['col']
    ptype = plan['type']
    prefix = collections_meta[cname]['default_prefix']
    
    fn = os.path.join(src_root, "extracted_catalogue", f"page_{pno:02d}.jpg")
    page = cv2.imread(fn)
    if page is None:
        print(f"Error loading {fn}")
        continue
        
    is_compact = 'compact' in ptype
    
    if ptype == 'large_right':
        cols = [1459, 1889, 2319]
        rows = [252, 1125]
        w, h = 387, 806
    elif ptype == 'large_left':
        cols = [72, 502, 931]
        rows = [252, 1125]
        w, h = 387, 806
    elif ptype == 'compact_right':
        cols = [1469, 1789, 2109, 2429]
        rows = [171, 775, 1378]
        w, h = 267, 557
    elif ptype == 'compact_left':
        cols = [82, 401, 721, 1041]
        rows = [171, 775, 1378]
        w, h = 267, 557
        
    d_idx = 1
    for r_idx, y in enumerate(rows):
        for c_idx, x in enumerate(cols):
            # 1. Clean Crop Door Panel
            # Add a slight 2px margin inside or tight crop
            door_crop = page[y:y+h, x:x+w]
            
            # 2. OCR below door
            lbl_h = 52 if is_compact else 65
            lbl_crop = page[y+h:y+h+lbl_h, max(0, x-10):min(page.shape[1], x+w+10)]
            ocr_res = reader.readtext(lbl_crop)
            ocr_text = ' '.join([r[1] for r in ocr_res])
            
            code = parse_code(ocr_text, prefix, d_idx)
            
            # Save door image
            img_filename = f"door_p{pno:02d}_{d_idx:02d}.jpg"
            out_cat = os.path.join(cat_doors, img_filename)
            out_pub = os.path.join(public_doors, img_filename)
            
            cv2.imwrite(out_cat, door_crop, [cv2.IMWRITE_JPEG_QUALITY, 95])
            cv2.imwrite(out_pub, door_crop, [cv2.IMWRITE_JPEG_QUALITY, 95])
            
            prod_obj = {
                "id": f"{prefix}_{pno:02d}_{d_idx:02d}",
                "page": pno,
                "collection": cname,
                "code": code,
                "image": img_filename,
                "lifestyle_image": collections_meta[cname]["hero_image"],
                "lifestyle_title": f"{cname} Architectural Elevation",
                "specs": {
                    "Material": collections_meta[cname]["material"],
                    "Surface Finish": collections_meta[cname]["finish"],
                    "Available Thickness": collections_meta[cname]["thickness"],
                    "Standard Sizes": "81\" x 30\", 81\" x 32\", 81\" x 36\", 84\" x 36\", 84\" x 38\" (Custom sizing available)",
                    "Core Construction": "Hardwood Kiln-Dried Solid Composite Core",
                    "Moisture Resistance": "Boiling Water Proof / High Humidity Resistant",
                    "Termite Protection": "100% Chemical Impregnated Borer Proof",
                    "Country of Origin": "India (Manufactured in Trichy)"
                }
            }
            
            all_products.append(prod_obj)
            collections_dict[cname]["products"].append(prod_obj)
            d_idx += 1

print(f"Extraction complete! Total products: {len(all_products)}")

# Deduplicate any duplicate codes within a collection
for cname, cdata in collections_dict.items():
    seen = set()
    for idx, p in enumerate(cdata["products"]):
        base_code = p["code"]
        if base_code in seen:
            p["code"] = f"{base_code}-{idx+1}"
        seen.add(p["code"])

final_data = {
    "collections": list(collections_dict.values()),
    "totalProducts": len(all_products),
    "allProducts": all_products
}

dest_json = os.path.join(src_root, "src", "data", "products.json")
with open(dest_json, "w", encoding="utf-8") as f:
    json.dump(final_data, f, indent=2)

print(f"Saved {dest_json}")
