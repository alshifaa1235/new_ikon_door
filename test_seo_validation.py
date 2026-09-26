import json
import re
import xml.etree.ElementTree as ET

print("=== 1. VALIDATING INDEX.HTML JSON-LD ===")
html = open('index.html', encoding='utf-8').read()
m = re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL)
assert m, "No JSON-LD in index.html"
schema = json.loads(m.group(1))
assert schema.get("@context") == "https://schema.org", "Invalid @context"
graph = schema.get("@graph", [])
assert len(graph) >= 5, f"Expected at least 5 entities in graph, found {len(graph)}"
for item in graph:
    print(f"  [OK] {item.get('@type')}: {item.get('name')}")

print("\n=== 2. VALIDATING SITEMAP.XML ===")
xml_content = open('public/sitemap.xml', encoding='utf-8').read()
root = ET.fromstring(xml_content)
namespaces = {
    'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9',
    'image': 'http://www.google.com/schemas/sitemap-image/1.1'
}
urls = root.findall('sm:url', namespaces)
print(f"  [OK] Total URLs in sitemap: {len(urls)}")

images = root.findall('.//image:image', namespaces)
print(f"  [OK] Total Image metadata entries: {len(images)}")
assert len(urls) >= 200, f"Expected >= 200 URLs, found {len(urls)}"
assert len(images) >= 180, f"Expected >= 180 images, found {len(images)}"

print("\n=== 3. VALIDATING ROBOTS.TXT ===")
robots = open('public/robots.txt', encoding='utf-8').read()
assert "User-agent: *" in robots, "Missing User-agent"
assert "Disallow: /admin" in robots, "Missing /admin disallow"
assert "Sitemap: https://newikondoors.com/sitemap.xml" in robots, "Missing sitemap directive"
print("  [OK] robots.txt directives valid")

print("\nALL SEO SYNTAX VALIDATIONS PASSED!")
