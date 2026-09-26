import json
import xml.etree.ElementTree as ET

with open('src/data/products.json', encoding='utf-8') as f:
    data = json.load(f)

base = 'https://newikondoors.com'
lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'
]

# Core pages
static_pages = [
    ('/', 1.0, 'daily'),
    ('/collections', 0.9, 'weekly'),
    ('/about', 0.8, 'monthly'),
    ('/branches', 0.85, 'monthly'),
    ('/catalogue', 0.85, 'monthly'),
    ('/testimonials', 0.7, 'monthly'),
    ('/contact', 0.8, 'monthly'),
    ('/request-quote', 0.85, 'monthly'),
]

for path, prio, freq in static_pages:
    lines.append('  <url>')
    lines.append(f'    <loc>{base}{path}</loc>')
    lines.append(f'    <priority>{prio}</priority>')
    lines.append(f'    <changefreq>{freq}</changefreq>')
    lines.append('  </url>')

# Collections
for col in data['collections']:
    slug = col['slug']
    name = col['name']
    hero = col.get('hero_image', '')
    lines.append('  <url>')
    lines.append(f'    <loc>{base}/collections/{slug}</loc>')
    lines.append('    <priority>0.85</priority>')
    lines.append('    <changefreq>weekly</changefreq>')
    if hero:
        img_url = f'{base}/doors/{hero}' if not hero.startswith('http') else hero
        lines.append('    <image:image>')
        lines.append(f'      <image:loc>{img_url}</image:loc>')
        lines.append(f'      <image:title>New Ikon {name}</image:title>')
        lines.append('    </image:image>')
    lines.append('  </url>')

# Products
product_count = 0
for col in data['collections']:
    c_name = col['name']
    for p in col.get('products', []):
        code = p['code']
        slug = code.replace(' ', '-')
        img = p.get('image', '')
        lines.append('  <url>')
        lines.append(f'    <loc>{base}/product/{slug}</loc>')
        lines.append('    <priority>0.75</priority>')
        lines.append('    <changefreq>weekly</changefreq>')
        if img:
            img_url = f'{base}/doors/{img}' if not img.startswith('http') else img
            lines.append('    <image:image>')
            lines.append(f'      <image:loc>{img_url}</image:loc>')
            lines.append(f'      <image:title>New Ikon {code} {c_name}</image:title>')
            lines.append(f'      <image:caption>New Ikon {code} {c_name} door manufactured in Trichy, Tamil Nadu</image:caption>')
            lines.append('    </image:image>')
        lines.append('  </url>')
        product_count += 1

lines.append('</urlset>')

output = '\n'.join(lines) + '\n'
with open('public/sitemap.xml', 'w', encoding='utf-8') as f:
    f.write(output)

# Validate XML parse
ET.fromstring(output)
print(f'Successfully generated and validated sitemap.xml with {len(static_pages) + len(data["collections"]) + product_count} URLs ({product_count} products with image metadata)!')
