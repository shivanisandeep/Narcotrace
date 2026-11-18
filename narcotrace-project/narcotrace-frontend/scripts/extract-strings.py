#!/usr/bin/env python3
"""Collect every user-facing English string in src/ into src/i18n/catalogue.json."""
import re, json, pathlib
root = pathlib.Path(__file__).resolve().parent.parent / 'src'
found = set()
def ok(s):
    s = re.sub(r'\s+', ' ', s).strip()
    if len(s) < 3 or not re.search(r'[A-Za-z]{3}', s): return None
    if re.search(r'[{}<>=;\\/]|https?:|^\W|\.(tsx?|png|svg|css)$|^[a-z][a-z0-9_.-]*$|^[A-Z0-9\-_.: ]+$', s) and not re.match(r'^[A-Z][^{}<>=;\\]*$', s): return None
    if re.match(r'^[a-z]+(-[a-z0-9\[\]:/.%]+)+( |$)', s): return None   # tailwind classes
    return s
for f in list(root.rglob('*.tsx')) + list(root.rglob('*.ts')):
    if 'i18n' in f.parts or f.name == 'i18n.tsx' or f.name == 'auto-translate.ts': continue
    src = f.read_text(encoding='utf-8')
    for m in re.finditer(r'>([^<>{}]+)<', src): found.add(ok(m.group(1)))                    # JSX text
    for m in re.finditer(r'\b(?:placeholder|title|aria-label|label|alt|description|subtitle)\s*[=:]\s*[\'"]([^\'"]+)[\'"]', src): found.add(ok(m.group(1)))
    for m in re.finditer(r"'([A-Z][^'\n]{3,80})'", src): found.add(ok(m.group(1)))          # string literals
    for m in re.finditer(r'"([A-Z][^"\n]{3,80})"', src): found.add(ok(m.group(1)))
found.discard(None)
out = sorted(found)
(root / 'i18n' / 'catalogue.json').write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding='utf-8')
print(len(out), 'strings')
