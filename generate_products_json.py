import json
import os

src_json = r"C:\Users\navee\.gemini\antigravity-ide\scratch\new-ikon-doors\extracted_catalogue\products_database.json"
dest_json = r"C:\Users\navee\.gemini\antigravity-ide\scratch\new-ikon-doors\src\data\products.json"

with open(src_json, "r", encoding="utf-8") as f:
    products = json.load(f)

collection_metadata = {
    "Marble Membrane Door": {
        "slug": "marble-membrane",
        "category": "Luxury Marble Finish",
        "description": "Exquisite Italian and Spanish marble veining combined with durable vacuum membrane fusion. Features high-definition stone textures accentuated with golden radial geometry.",
        "material": "High-Density Moisture-Resistant Core + Imported Marble-Grain PVC Membrane",
        "finish": "Gloss / Matte Velvet Stone Texture with Gold Accent inlays",
        "thickness": "30mm / 32mm / 35mm",
        "application": "Living Room, Master Bed, Executive Cabin, Villa Main Internal",
        "tagline": "The Majesty of Natural Stone with Timber Warmth",
        "hero_image": "lifestyle_page_03.jpg"
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
        "hero_image": "lifestyle_page_04.jpg"
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
        "hero_image": "lifestyle_page_09.jpg"
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
        "hero_image": "lifestyle_page_11.jpg"
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
        "hero_image": "lifestyle_page_13.jpg"
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
        "hero_image": "lifestyle_page_17.jpg"
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
        "hero_image": "lifestyle_page_18.jpg"
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
        "hero_image": "lifestyle_page_19.jpg"
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
        "hero_image": "lifestyle_page_23.jpg"
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
        "hero_image": "lifestyle_page_24.jpg"
    }
}

# Attach rich properties to each product
collections_dict = {}
for name, meta in collection_metadata.items():
    collections_dict[name] = {
        **meta,
        "name": name,
        "products": []
    }

for p in products:
    c_name = p["collection"]
    if c_name in collections_dict:
        # Generate specs
        p["specs"] = {
            "Material": collections_dict[c_name]["material"],
            "Surface Finish": collections_dict[c_name]["finish"],
            "Available Thickness": collections_dict[c_name]["thickness"],
            "Standard Sizes": "81\" x 30\", 81\" x 32\", 81\" x 36\", 84\" x 36\", 84\" x 38\" (Custom sizing available)",
            "Core Construction": "Hardwood Kiln-Dried Solid Composite Core",
            "Moisture Resistance": "Boiling Water Proof / High Humidity Resistant",
            "Termite Protection": "100% Chemical Impregnated Borer Proof",
            "Country of Origin": "India (Manufactured in Trichy)"
        }
        collections_dict[c_name]["products"].append(p)

final_data = {
    "collections": list(collections_dict.values()),
    "totalProducts": len(products),
    "allProducts": products
}

with open(dest_json, "w", encoding="utf-8") as f:
    json.dump(final_data, f, indent=2)

print(f"Generated {dest_json} with {len(final_data['collections'])} collections and {final_data['totalProducts']} products.")
