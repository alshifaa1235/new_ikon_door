import cv2
import json
import os
import re

src_root = r"C:\Users\navee\.gemini\antigravity-ide\scratch\new-ikon-doors"
public_doors = os.path.join(src_root, "public", "doors")
cat_doors = os.path.join(src_root, "extracted_catalogue", "products")
os.makedirs(public_doors, exist_ok=True)
os.makedirs(cat_doors, exist_ok=True)

# 1. Complete Collection Metadata matching physical catalogue
collections_meta = {
    "Marble Membrane Door": {
        "slug": "marble-membrane",
        "category": "Luxury Marble Finish",
        "tagline": "The Majesty of Natural Stone with Timber Warmth",
        "description": "Exquisite Italian and Spanish marble veining combined with durable vacuum membrane fusion. Features high-definition stone textures accentuated with golden radial geometry.",
        "material": "High-Density Moisture-Resistant Core + Imported Marble-Grain PVC Membrane",
        "finish": "Gloss / Matte Velvet Stone Texture with Gold Accent inlays",
        "thickness": "30mm / 32mm / 35mm",
        "application": "Living Room, Master Bed, Executive Cabin, Villa Main Internal",
        "hero_image": "/doors/lifestyle_page_03.jpg",
        "lifestyle_image": "/doors/lifestyle_page_03.jpg",
        "default_prefix": "MG",
        "sort_order": 1
    },
    "UV Membrane Door": {
        "slug": "uv-membrane",
        "category": "Ultra-Violet High Gloss Finish",
        "tagline": "Dazzling Reflections That Illuminate Your Living Spaces",
        "description": "Super-glossy UV protective coating over calibrated engineered panels. Unrivaled scratch resistance and mirror-like reflection designed for modern contemporary homes.",
        "material": "Kiln-Seasoned Hardwood Core + Multi-Layer UV Curable Resin + Membrane",
        "finish": "Ultra High-Gloss UV Shield / Mirror Polish",
        "thickness": "30mm / 32mm / 35mm / 38mm",
        "application": "Bedroom, Apartment Interior, Luxury Suite, Modern Villas",
        "hero_image": "/doors/lifestyle_page_04.jpg",
        "lifestyle_image": "/doors/lifestyle_page_04.jpg",
        "default_prefix": "UV",
        "sort_order": 2
    },
    "Mica Door": {
        "slug": "mica-doors",
        "category": "Architectural Laminate",
        "tagline": "Rugged Durability Meets Timeless Woodcraft",
        "description": "Heavy-duty 1mm decorative laminates pressed with thermal waterproof adhesives. Delivers authentic timber tactile grain and resilient resistance to wear, heat, and impacts.",
        "material": "Solid Core Blockboard / Flush Core + 1.0mm Premium Mica Laminate",
        "finish": "Natural Woodgrain Embossed / Matte Texture",
        "thickness": "32mm / 35mm / 38mm",
        "application": "High-traffic Passages, Commercial Offices, Hospitality, Master Bedrooms",
        "hero_image": "/doors/lifestyle_page_09.jpg",
        "lifestyle_image": "/doors/lifestyle_page_09.jpg",
        "default_prefix": "MD",
        "sort_order": 3
    },
    "Steel Patti Door": {
        "slug": "steel-patti",
        "category": "Metallic Inlay Architecture",
        "tagline": "Modern Geometric Splendor Defined by Steel",
        "description": "Architectural precision grooved stainless steel patti inlays integrated into rich walnut and charcoal wood membranes. Clean minimalist horizontal and vertical lines.",
        "material": "Moisture-Proof Engineered Composite + Brushed Stainless Steel (SS304) Inlays",
        "finish": "Brushed Chrome / Titanium Metallic Inlay with Silk Wood Finish",
        "thickness": "32mm / 35mm / 38mm",
        "application": "Contemporary Living, Main Entrances, Luxury Suites, Executive Offices",
        "hero_image": "/doors/lifestyle_page_11.jpg",
        "lifestyle_image": "/doors/lifestyle_page_11.jpg",
        "default_prefix": "SS",
        "sort_order": 4
    },
    "Plain Membrane Door": {
        "slug": "plain-membrane",
        "category": "Subtle Geometric CNC Craft",
        "tagline": "Understated Elegance in Every Precision Groove",
        "description": "Pure minimalist CNC routed grooves paired with warm monolithic earth tones. Clean, uncluttered, and adaptable to minimalist interior architectural aesthetics.",
        "material": "Heavy-Density Fiber Core + Seamless German Membrane Vacuum Press",
        "finish": "Satin Velvet Monolith / Fine Grain Matte",
        "thickness": "30mm / 32mm / 35mm",
        "application": "Bedrooms, Study Rooms, Hospital Suites, Commercial Developments",
        "hero_image": "/doors/lifestyle_page_13.jpg",
        "lifestyle_image": "/doors/lifestyle_page_13.jpg",
        "default_prefix": "MM",
        "sort_order": 5
    },
    "Kumil Membrane Door": {
        "slug": "kumil-membrane",
        "category": "Heritage South Indian Craft",
        "tagline": "Sacred Traditional Motifs Reimagined for Modern Homes",
        "description": "Traditional South Indian artistic Kumil motifs translated into modern vacuum-sealed membrane doors. Deep carved heritage panels with lasting moisture resistance.",
        "material": "Select Solid Core Timber + Deep CNC Carving + Heat-bonded Membrane",
        "finish": "Warm Teak & Rosewood Heritage Stain Finish",
        "thickness": "32mm / 35mm / 38mm",
        "application": "Puja Room, Traditional Entrances, Heritage Homes, Villas",
        "hero_image": "/doors/door_mk_01.jpg",
        "lifestyle_image": "/doors/lifestyle_page_17.jpg",
        "default_prefix": "MK",
        "sort_order": 6
    },
    "2D Membrane Door": {
        "slug": "2d-membrane",
        "category": "Dual-Tone Decorative Membrane",
        "tagline": "Contrast Inlays with Seamless Membrane Sealing",
        "description": "Dynamic dual-tone composite panel elevations featuring contrasting timber veneers and contemporary arch geometric inlays.",
        "material": "Kiln-Seasoned Solid Core + Dual-Color Membrane Press",
        "finish": "Dual Tone Matte & Textured Grain",
        "thickness": "30mm / 32mm / 35mm",
        "application": "Living Room, Bedrooms, Modern Apartments",
        "hero_image": "/doors/door_2dm_01.jpg",
        "lifestyle_image": "/doors/lifestyle_page_17.jpg",
        "default_prefix": "2DM",
        "sort_order": 7
    },
    "3D Membrane Door": {
        "slug": "3d-membrane",
        "category": "Dimensional Sculpted Panels",
        "tagline": "Sculptural Depth That Transforms Flat Walls into Art",
        "description": "Multi-dimensional CNC carved relief patterns that cast subtle dynamic shadows under interior lighting. Creates dramatic sculptural presence across doorways.",
        "material": "Calibrated Solid Core + Multi-axis 3D CNC Routing + Seamless Membrane",
        "finish": "3D Shadow Relief / Deep Matte Polymer",
        "thickness": "32mm / 35mm / 40mm",
        "application": "Feature Doors, Home Theatres, Main Hall Entrances, Designer Penthouses",
        "hero_image": "/doors/door_3dd_01.jpg",
        "lifestyle_image": "/doors/lifestyle_page_18.jpg",
        "default_prefix": "3DD",
        "sort_order": 8
    },
    "Teak Wood Door": {
        "slug": "teak-wood",
        "category": "Solid Hardwood Teak",
        "tagline": "Masterpiece Solid Timber for Grand Entrances",
        "description": "Sublime natural solid teak wood doors featuring intricate hand-carved floral, temple, and contemporary geometric woodwork. Finished with premium polyurethane protection.",
        "material": "100% Solid Seasoned Teak Wood",
        "finish": "Natural Teak Grain / Polyurethane Protective Clear Coat",
        "thickness": "35mm / 38mm / 42mm",
        "application": "Main Entrance, Villa Front Doors, Grand Porticos, Temple Rooms",
        "hero_image": "/doors/door_td_01.jpg",
        "lifestyle_image": "/doors/lifestyle_page_18.jpg",
        "default_prefix": "TD",
        "sort_order": 9
    },
    "Micro Coating Door": {
        "slug": "micro-coating",
        "category": "Advanced Nano-Polymer Finish",
        "tagline": "The Future of Velvet Touch Micro-Engineered Finishes",
        "description": "State-of-the-art micro-polymeric surface seal that repels smudges, dust, and water splashes while delivering a hyper-smooth velvet soft-touch experience.",
        "material": "Hydraulic Pressed Composite Core + Nano-Micro Polymeric Seal",
        "finish": "Ultra-Matte Velvet Soft-Touch / Zero-Smudge Texture",
        "thickness": "30mm / 32mm / 35mm",
        "application": "Luxury Apartments, Modern Condos, Bathrooms & Ensuites, Bedrooms",
        "hero_image": "/doors/lifestyle_page_19.jpg",
        "lifestyle_image": "/doors/lifestyle_page_19.jpg",
        "default_prefix": "LD",
        "sort_order": 10
    },
    "Mica Membrane Door": {
        "slug": "mica-membrane",
        "category": "Hybrid Mica Membrane Fusion",
        "tagline": "Tactile Architectural Laminate Meets Seamless Membrane Sealing",
        "description": "Innovative combination of decorative architectural mica inlays sealed with perimeter membrane wrapping for enhanced durability and moisture protection.",
        "material": "Composite Solid Core + Premium Mica Inlay + Thermal Membrane Wrap",
        "finish": "Satin Texture / Gloss Geometric Inlay",
        "thickness": "32mm / 35mm / 38mm",
        "application": "Interior Passages, Living Rooms, Contemporary Villas",
        "hero_image": "/doors/door_mmd_01.jpg",
        "lifestyle_image": "/doors/lifestyle_page_19.jpg",
        "default_prefix": "MMD",
        "sort_order": 11
    },
    "WPVC Digital Door": {
        "slug": "wpvc-digital",
        "category": "100% Waterproof Composite",
        "tagline": "100% Waterproof & Termite-Proof for Wet & Exterior Zones",
        "description": "Wood-Plastic Polymer Composite engineered for zero water absorption, zero warping, and 100% termite proofing. Features vibrant high-resolution UV digital graphics and clean CNC plain elevations.",
        "material": "100% WPVC Solid Synthetic Polymer Composite Core",
        "finish": "High-Definition Digital Print with Protective Clear Coat",
        "thickness": "30mm / 32mm",
        "application": "Bathrooms, Restrooms, Coastal Properties, High-Moisture Utility Balconies",
        "hero_image": "/doors/door_wd_01.jpg",
        "lifestyle_image": "/doors/lifestyle_page_23.jpg",
        "default_prefix": "WD",
        "sort_order": 12
    },
    "Rubber Wood Door": {
        "slug": "rubber-wood",
        "category": "Sustainable Solid Hardwood",
        "tagline": "Natural Warmth and Strength from Sustainable Timber",
        "description": "Ecologically sustainable finger-jointed treated solid rubberwood. Kiln-dried to 10% moisture content for unmatched dimensional stability and warm organic grain.",
        "material": "100% Solid Kiln-Dried Chemically Treated Plantation Rubberwood",
        "finish": "Natural Satin Lacquer / Honey Timber Stain",
        "thickness": "32mm / 35mm / 38mm",
        "application": "Eco-Luxury Residences, Bedrooms, Balcony Entrances, Resort Suites",
        "hero_image": "/doors/door_rw_01.jpg",
        "lifestyle_image": "/doors/lifestyle_page_24.jpg",
        "default_prefix": "RW",
        "sort_order": 13
    }
}

# 2. Comprehensive 100% Page Plans matching the entire catalogue
page_plans = [
    # Page 3: Marble (6 large right)
    {'page': 3, 'col': 'Marble Membrane Door', 'type': 'large_right', 'codes': [f"MG - {i:02d}" for i in range(1, 7)]},
    
    # Page 4: UV (6 large right)
    {'page': 4, 'col': 'UV Membrane Door', 'type': 'large_right', 'codes': [f"UV - {i}" for i in range(101, 107)]},
    # Page 5: UV (12 compact left, 6 large right)
    {'page': 5, 'col': 'UV Membrane Door', 'type': 'compact_left', 'codes': [f"UV - {i}" for i in range(107, 119)]},
    {'page': 5, 'col': 'UV Membrane Door', 'type': 'large_right', 'codes': [f"UV - {i}" for i in range(119, 125)]},
    # Page 6: UV (6 large left, 12 compact right)
    {'page': 6, 'col': 'UV Membrane Door', 'type': 'large_left', 'codes': [f"UV - {i}" for i in range(125, 131)]},
    {'page': 6, 'col': 'UV Membrane Door', 'type': 'compact_right', 'codes': [f"UV - {i}" for i in range(131, 143)]},
    # Page 7: UV (12 compact left, 12 compact right)
    {'page': 7, 'col': 'UV Membrane Door', 'type': 'compact_left', 'codes': [f"UV - {i}" for i in range(143, 155)]},
    {'page': 7, 'col': 'UV Membrane Door', 'type': 'compact_right', 'codes': [f"UV - {i}" for i in range(155, 167)]},
    # Page 8: UV (12 compact left, 12 compact right)
    {'page': 8, 'col': 'UV Membrane Door', 'type': 'compact_left', 'codes': [f"UV - {i}" for i in range(167, 179)]},
    {'page': 8, 'col': 'UV Membrane Door', 'type': 'compact_right', 'codes': [f"UV - {i}" for i in range(179, 191)]},
    
    # Page 9: Mica (6 large right)
    {'page': 9, 'col': 'Mica Door', 'type': 'large_right', 'codes': [f"MD - {i}" for i in range(301, 307)]},
    # Page 10: Mica (12 compact left, 12 compact right)
    {'page': 10, 'col': 'Mica Door', 'type': 'compact_left', 'codes': [f"MD - {i}" for i in range(307, 319)]},
    {'page': 10, 'col': 'Mica Door', 'type': 'compact_right', 'codes': [f"MD - {i}" for i in range(319, 331)]},
    
    # Page 11: Steel Patti (6 large right)
    {'page': 11, 'col': 'Steel Patti Door', 'type': 'large_right', 'codes': [f"SS - {i}" for i in range(401, 407)]},
    # Page 12: Steel Patti (12 compact left, 12 compact right)
    {'page': 12, 'col': 'Steel Patti Door', 'type': 'compact_left', 'codes': [f"SS - {i}" for i in range(407, 419)]},
    {'page': 12, 'col': 'Steel Patti Door', 'type': 'compact_right', 'codes': [f"SS - {i}" for i in range(419, 431)]},
    
    # Page 13: Plain Membrane (6 large right)
    {'page': 13, 'col': 'Plain Membrane Door', 'type': 'large_right', 'codes': [f"MM - {i}" for i in range(501, 507)]},
    # Page 14: Plain Membrane (6 large left, 12 compact right)
    {'page': 14, 'col': 'Plain Membrane Door', 'type': 'large_left', 'codes': [f"MM - {i}" for i in range(507, 513)]},
    {'page': 14, 'col': 'Plain Membrane Door', 'type': 'compact_right', 'codes': [f"MM - {i}" for i in range(513, 525)]},
    # Page 15: Plain Membrane (12 compact left, 6 large right)
    {'page': 15, 'col': 'Plain Membrane Door', 'type': 'compact_left', 'codes': [f"MM - {i}" for i in range(525, 537)]},
    {'page': 15, 'col': 'Plain Membrane Door', 'type': 'large_right', 'codes': [f"MM - {i}" for i in range(537, 543)]},
    # Page 16: Plain Membrane (12 compact left, 12 compact right)
    {'page': 16, 'col': 'Plain Membrane Door', 'type': 'compact_left', 'codes': [f"MM - {i}" for i in range(543, 555)]},
    {'page': 16, 'col': 'Plain Membrane Door', 'type': 'compact_right', 'codes': [f"MM - {i}" for i in range(555, 567)]},
    
    # Page 17: Kumil (12 compact left: MK-601 to MK-612) and 2D (12 compact right: 2DM-701 to 2DM-712)
    {'page': 17, 'col': 'Kumil Membrane Door', 'type': 'compact_left', 'codes': [f"MK - {i}" for i in range(601, 613)]},
    {'page': 17, 'col': '2D Membrane Door', 'type': 'compact_right', 'codes': [f"2DM - {i}" for i in range(701, 713)]},
    
    # Page 18: 3D (12 compact left: 3DD-751 to 3DD-762) and Teak Wood (6 large right: TD-801 to TD-806)
    {'page': 18, 'col': '3D Membrane Door', 'type': 'compact_left', 'codes': [f"3DD - {i}" for i in range(751, 763)]},
    {'page': 18, 'col': 'Teak Wood Door', 'type': 'large_right', 'codes': [f"TD - {i}" for i in range(801, 807)]},
    
    # Page 19: Micro Coating (6 large right)
    {'page': 19, 'col': 'Micro Coating Door', 'type': 'large_right', 'codes': [f"LD - {i}" for i in range(901, 907)]},
    # Page 20: Micro Coating (6 large left, 12 compact right)
    {'page': 20, 'col': 'Micro Coating Door', 'type': 'large_left', 'codes': [f"LD - {i}" for i in range(907, 913)]},
    {'page': 20, 'col': 'Micro Coating Door', 'type': 'compact_right', 'codes': [f"LD - {i}" for i in range(913, 925)]},
    # Page 21: Micro Coating (12 compact left, 12 compact right)
    {'page': 21, 'col': 'Micro Coating Door', 'type': 'compact_left', 'codes': [f"LD - {i}" for i in range(925, 937)]},
    {'page': 21, 'col': 'Micro Coating Door', 'type': 'compact_right', 'codes': [f"LD - {i}" for i in range(937, 949)]},
    # Page 22: Micro Coating (12 compact left: LD-949 to LD-960) and Mica Membrane (12 compact right: MMD-1001 to MMD-1012)
    {'page': 22, 'col': 'Micro Coating Door', 'type': 'compact_left', 'codes': [f"LD - {i}" for i in range(949, 961)]},
    {'page': 22, 'col': 'Mica Membrane Door', 'type': 'compact_right', 'codes': [f"MMD - {i}" for i in range(1001, 1013)]},
    
    # Page 23: WPVC Digital (6 large left: WD-1051 to WD-1056) and WPVC Digital & Plain (12 compact right: WD-1057 to WD-1068)
    {'page': 23, 'col': 'WPVC Digital Door', 'type': 'large_left', 'codes': [f"WD - {i}" for i in range(1051, 1057)]},
    {'page': 23, 'col': 'WPVC Digital Door', 'type': 'compact_right', 'codes': [f"WD - {i}" for i in range(1057, 1069)]},
    
    # Page 24: Rubber Wood (6 large left: RW-2001 to RW-2006)
    {'page': 24, 'col': 'Rubber Wood Door', 'type': 'large_left', 'codes': [f"RW - {i}" for i in range(2001, 2007)]},
]

# Extract lifestyles for collections that have full-bleed left images
lifestyle_pages = {
    'Marble Membrane Door': 3,
    'UV Membrane Door': 4,
    'Mica Door': 9,
    'Steel Patti Door': 11,
    'Plain Membrane Door': 13,
    'Micro Coating Door': 19,
}
for cname, pno in lifestyle_pages.items():
    fn = os.path.join(src_root, "extracted_catalogue", f"page_{pno:02d}.jpg")
    pimg = cv2.imread(fn)
    if pimg is not None:
        h, w, _ = pimg.shape
        lifestyle_crop = pimg[:, 0:int(w*0.5)]
        out_ls = os.path.join(public_doors, f"lifestyle_page_{pno:02d}.jpg")
        cv2.imwrite(out_ls, lifestyle_crop, [cv2.IMWRITE_JPEG_QUALITY, 95])
        # Webp
        out_ls_webp = os.path.join(public_doors, f"lifestyle_page_{pno:02d}.webp")
        cv2.imwrite(out_ls_webp, lifestyle_crop, [cv2.IMWRITE_WEBP_QUALITY, 92])

all_products = []
collections_dict = {
    k: {
        "slug": v["slug"],
        "name": k,
        "category": v["category"],
        "tagline": v["tagline"],
        "description": v["description"],
        "material": v["material"],
        "finish": v["finish"],
        "thickness": v["thickness"],
        "application": v["application"],
        "hero_image": v["hero_image"],
        "sort_order": v["sort_order"],
        "published": True,
        "products": []
    }
    for k, v in collections_meta.items()
}

prod_id_counter = 1

for plan in page_plans:
    pno = plan['page']
    cname = plan['col']
    ptype = plan['type']
    codes = plan['codes']
    col_info = collections_meta[cname]
    
    fn = os.path.join(src_root, "extracted_catalogue", f"page_{pno:02d}.jpg")
    page = cv2.imread(fn)
    if page is None:
        print(f"Error loading {fn}")
        continue
        
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

    c_idx_total = 0
    for r_idx, y in enumerate(rows):
        for c_idx, x in enumerate(cols):
            if c_idx_total >= len(codes):
                break
            code = codes[c_idx_total]
            clean_code_slug = code.replace(" ", "").replace("-", "_").lower()
            
            # Crop door panel
            door_crop = page[y:y+h, x:x+w]
            
            # Image filename based on code for permanent consistency
            img_filename = f"door_{clean_code_slug}.jpg"
            webp_filename = f"door_{clean_code_slug}.webp"
            
            out_jpg = os.path.join(public_doors, img_filename)
            out_webp = os.path.join(public_doors, webp_filename)
            
            cv2.imwrite(out_jpg, door_crop, [cv2.IMWRITE_JPEG_QUALITY, 95])
            cv2.imwrite(out_webp, door_crop, [cv2.IMWRITE_WEBP_QUALITY, 92])
            
            # If this is the first product of the collection, set as hero_image if not lifestyle
            if not collections_dict[cname]["hero_image"] or "door_p" in collections_dict[cname]["hero_image"] or collections_dict[cname]["hero_image"].endswith("01.jpg"):
                if "lifestyle" not in collections_dict[cname]["hero_image"]:
                    collections_dict[cname]["hero_image"] = f"/doors/{img_filename}"
            
            prod_obj = {
                "id": prod_id_counter,
                "code": code,
                "name": f"{cname} ({code})",
                "collection": cname,
                "collection_slug": col_info["slug"],
                "collection_id": col_info["sort_order"],
                "image": f"/doors/{img_filename}",
                "lifestyle_image": col_info.get("lifestyle_image", ""),
                "lifestyle_title": f"{cname} Architectural Elevation",
                "short_description": f"{cname} elevation model {code} crafted with high-density kiln-seasoned core by New Ikon Doors in Trichy.",
                "description": f"New Ikon Doors architectural model {code} from the {cname} series. Precision calibrated for residential and commercial projects.",
                "material": col_info["material"],
                "finish": col_info["finish"],
                "available_sizes": "81\" x 30\", 81\" x 32\", 81\" x 36\", 84\" x 36\", 84\" x 38\" (Custom sizing available)",
                "applications": col_info["application"],
                "specs": {
                    "Model Code": code,
                    "Collection": cname,
                    "Material": col_info["material"],
                    "Surface Finish": col_info["finish"],
                    "Available Thickness": col_info["thickness"],
                    "Standard Sizes": "81\" x 30\", 81\" x 32\", 81\" x 36\", 84\" x 36\", 84\" x 38\" (Custom sizing available)",
                    "Core Construction": "Hardwood Kiln-Dried Solid Composite Core",
                    "Moisture Resistance": "Boiling Water Proof / High Humidity Resistant",
                    "Termite Protection": "100% Chemical Impregnated Borer Proof",
                    "Country of Origin": "India (Manufactured in Trichy, Tamil Nadu)"
                },
                "features": [
                    "High-precision CNC routing",
                    "100% Solid hardwood core",
                    "Zero warping and moisture-resistant barrier",
                    "Available in custom builder dimensions"
                ],
                "sort_order": prod_id_counter,
                "featured": (c_idx_total < 2),
                "published": True
            }
            
            all_products.append(prod_obj)
            collections_dict[cname]["products"].append(prod_obj)
            
            prod_id_counter += 1
            c_idx_total += 1

collections_list = list(collections_dict.values())
collections_list.sort(key=lambda x: x["sort_order"])

output_data = {
    "collections": collections_list,
    "products": all_products
}

out_json = os.path.join(src_root, "src", "data", "products.json")
with open(out_json, "w", encoding="utf-8") as f:
    json.dump(output_data, f, indent=2, ensure_ascii=False)

print(f"SUCCESS: Extracted {len(all_products)} authentic doors across {len(collections_list)} collections!")
for c in collections_list:
    print(f"  - {c['name']} ({c['slug']}): {len(c['products'])} doors")
