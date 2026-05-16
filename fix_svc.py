import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r'd:\creator craft\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Wrap h4 + p inside each svc-card with a .svc-body div
# Pattern: after svc-icon-wrap closing div, wrap remaining h4+p
pattern = r'(<div class="svc-card">)(<div class="svc-icon-wrap">[^<]*</div>)(<h4>[^<]*</h4>)(<p>[^<]*</p>)(</div>)'
replacement = r'\1\2<div class="svc-body">\3\4</div>\5'

new_content, count = re.subn(pattern, replacement, content)
print(f"Replaced {count} svc-cards")

with open(r'd:\creator craft\index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done!")
