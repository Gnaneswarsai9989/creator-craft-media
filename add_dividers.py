import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open(r'd:\creator craft\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Actual comment format from HTML:
# <!-- ========== MARQUEE ========== -->  (with unicode box chars)
# Use section endings + next section comment

dividers = [
    ('MARQUEE',     'gd-vi'),
    ('TOOLS ORBIT', 'gd-am'),
    ('ABOUT',       'gd-cyan'),
    ('CO-FOUNDERS', 'gd-rose'),
    ('SERVICES',    'gd-vi'),
    ('COURSES',     'gd-am'),
    ('CTA BAND',    'gd-vi'),
    ('CONTACT',     'gd-cyan'),
]

for keyword, cls in dividers:
    # Find the comment line for this section
    pattern = rf'(</section>\r?\n\r?\n)(<!-- [^\n]*{re.escape(keyword)}[^\n]* -->)'
    match = re.search(pattern, content)
    if match:
        replacement = f'{match.group(1)}<div class="glow-divider {cls}"></div>\n{match.group(2)}'
        content = content[:match.start()] + replacement + content[match.end():]
        print(f"OK [{cls}]: {keyword}")
    else:
        print(f"MISS: {keyword}")

with open(r'd:\creator craft\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")
