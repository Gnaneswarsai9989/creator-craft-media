import sys

html_code = open('temp_html.txt', 'r', encoding='utf-8').read()
css_code = open('temp_css.txt', 'r', encoding='utf-8').read()

idx_html = open('index.html', encoding='utf-8').read()
start_marker = '<div class="course-grid">'
end_marker = '    </div>\n  </section>\n\n  <div class="glow-divider gd-vi">'
start_pos = idx_html.find(start_marker)
end_pos = idx_html.find(end_marker)
if start_pos != -1 and end_pos != -1:
    new_html = idx_html[:start_pos] + html_code + '\n' + idx_html[end_pos:]
    open('index.html', 'w', encoding='utf-8').write(new_html)
    print('HTML successfully updated.')
else:
    print('HTML markers not found.')

idx_css = open('style.css', encoding='utf-8').read()
start_marker = '.courses-sec {'
end_marker = '/* ══════════════════════════════════════\n   CTA BAND'
start_pos = idx_css.find(start_marker)
end_pos = idx_css.find(end_marker)
if start_pos != -1 and end_pos != -1:
    new_css = idx_css[:start_pos] + css_code + '\n\n' + idx_css[end_pos:]
    open('style.css', 'w', encoding='utf-8').write(new_css)
    print('CSS successfully updated.')
else:
    print('CSS markers not found.')
