import re

with open(r'd:\creator craft\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find start and end markers
start_marker = '    <div class="orbit-wrap">'
end_marker = '    </div>\n  </div>\n</section>'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx) + len(end_marker)

print(f"Start: {start_idx}, End: {end_idx}")
print("Old block preview:", content[start_idx:start_idx+100])

new_orbit = '''    <div class="orbit-wrap">

      <!-- Center logo -->
      <div class="orbit-center">
        <img src="logo.png" alt="CCM" class="orbit-logo" />
      </div>

      <!-- Sweeping arc (half-circle glow that rotates) -->
      <svg class="orbit-sweep-svg" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stop-color="rgba(99,102,241,0)"   />
            <stop offset="60%"  stop-color="rgba(99,102,241,0.4)" />
            <stop offset="100%" stop-color="rgba(165,180,252,1)"  />
          </linearGradient>
        </defs>
        <path class="orbit-sweep-arc"
          d="M 250,30 A 220,220 0 0 1 250,470"
          fill="none"
          stroke="url(#sweepGrad)"
          stroke-width="2.5"
          stroke-linecap="round"/>
        <circle class="orbit-sweep-dot" cx="250" cy="30" r="5" fill="#a5b4fc" filter="url(#dotGlow)"/>
        <defs>
          <filter id="dotGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
      </svg>

      <!-- Single ring: all 10 tools, evenly spaced 36deg apart -->
      <div class="orbit-ring ring1">
        <div class="t-item" style="--ang:0deg">
          <div class="tool-icon"><svg viewBox="0 0 48 48" width="30" height="30" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="10" fill="#10a37f"/><path d="M24 10c-5.523 0-10 4.477-10 10 0 1.72.437 3.338 1.203 4.752L13 38l13.248-2.203A10 10 0 1024 10z" fill="none" stroke="white" stroke-width="2.5" stroke-linejoin="round"/><circle cx="24" cy="20" r="3.5" fill="white"/></svg></div>
          <span>ChatGPT</span>
        </div>
        <div class="t-item" style="--ang:36deg">
          <div class="tool-icon ti-gem"><svg viewBox="0 0 48 48" width="30" height="30" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gemGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#4285f4"/><stop offset="50%" style="stop-color:#9c27b0"/><stop offset="100%" style="stop-color:#e91e63"/></linearGradient></defs><rect width="48" height="48" rx="10" fill="#0d0d0d"/><path d="M24 8 C24 8 26 18 34 24 C26 30 24 40 24 40 C24 40 22 30 14 24 C22 18 24 8 24 8Z" fill="url(#gemGrad)"/></svg></div>
          <span>Gemini</span>
        </div>
        <div class="t-item" style="--ang:72deg">
          <div class="tool-icon ti-grok"><svg viewBox="0 0 48 48" width="30" height="30" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="10" fill="#111"/><text x="24" y="33" text-anchor="middle" font-size="22" font-weight="900" font-family="sans-serif" fill="white">X</text></svg></div>
          <span>Grok</span>
        </div>
        <div class="t-item" style="--ang:108deg">
          <div class="tool-icon ti-el"><svg viewBox="0 0 48 48" width="30" height="30" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="10" fill="#111"/><rect x="9"  y="20" width="5" height="8"  rx="2.5" fill="white" opacity="0.5"/><rect x="17" y="14" width="5" height="20" rx="2.5" fill="white" opacity="0.75"/><rect x="25" y="10" width="5" height="28" rx="2.5" fill="white"/><rect x="33" y="16" width="5" height="16" rx="2.5" fill="white" opacity="0.6"/></svg></div>
          <span>ElevenLabs</span>
        </div>
        <div class="t-item" style="--ang:144deg">
          <div class="tool-icon"><svg viewBox="0 0 48 48" width="30" height="30" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="8" fill="#00005b"/><text x="24" y="32" text-anchor="middle" font-size="18" font-weight="bold" font-family="serif" fill="#9999ff">Pr</text></svg></div>
          <span>Premiere Pro</span>
        </div>
        <div class="t-item" style="--ang:180deg">
          <div class="tool-icon ti-ae"><svg viewBox="0 0 48 48" width="30" height="30" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="8" fill="#00005b"/><text x="24" y="32" text-anchor="middle" font-size="18" font-weight="bold" font-family="serif" fill="#9f9fff">Ae</text></svg></div>
          <span>After Effects</span>
        </div>
        <div class="t-item" style="--ang:216deg">
          <div class="tool-icon ti-fcp"><svg viewBox="0 0 48 48" width="30" height="30" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="8" fill="#1c1c1e"/><polygon points="24,8 38,24 24,40 10,24" fill="none" stroke="#e5474b" stroke-width="2.5"/><polygon points="24,14 33,24 24,34 15,24" fill="#e5474b"/></svg></div>
          <span>Final Cut Pro</span>
        </div>
        <div class="t-item" style="--ang:252deg">
          <div class="tool-icon ti-dv"><svg viewBox="0 0 48 48" width="30" height="30" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="8" fill="#1a1a2e"/><circle cx="24" cy="24" r="13" fill="none" stroke="#e8b400" stroke-width="2.5"/><circle cx="24" cy="24" r="6" fill="#e8b400"/></svg></div>
          <span>DaVinci</span>
        </div>
        <div class="t-item" style="--ang:288deg">
          <div class="tool-icon ti-cap"><svg viewBox="0 0 48 48" width="30" height="30" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="24" fill="#000"/><circle cx="24" cy="24" r="14" fill="none" stroke="white" stroke-width="3"/><circle cx="24" cy="24" r="5" fill="white"/><line x1="24" y1="10" x2="24" y2="4" stroke="white" stroke-width="3" stroke-linecap="round"/></svg></div>
          <span>CapCut</span>
        </div>
        <div class="t-item" style="--ang:324deg">
          <div class="tool-icon ti-whisk"><svg viewBox="0 0 48 48" width="30" height="30" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="whiskGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#ff6b6b"/><stop offset="100%" style="stop-color:#ffd93d"/></linearGradient></defs><rect width="48" height="48" rx="10" fill="#0d0d0d"/><line x1="24" y1="24" x2="24" y2="10" stroke="url(#whiskGrad)" stroke-width="2.5" stroke-linecap="round"/><circle cx="24" cy="24" r="4" fill="url(#whiskGrad)"/></svg></div>
          <span>Whisk AI</span>
        </div>
      </div>

    </div>
  </div>
</section>'''

new_content = content[:start_idx] + new_orbit
# Find what comes after the closing section tag
after_section = content.find('\n\n', end_idx)
if after_section > 0:
    new_content += content[after_section:]

with open(r'd:\creator craft\index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done! File written.")
