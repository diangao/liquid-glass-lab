// <glass-nav> — a liquid-glass dropdown nav as a Web Component.
//
// Usage:
//   <glass-nav material="edge-lens" label="dian's corner">
//     <a href="#writing">Scribbles</a>
//     <a href="#log">Tinkering</a>
//     <a href="#now">Up to</a>
//     <a href="#contact">Knock knock</a>
//   </glass-nav>
//
// material: "soft-ripple" | "edge-lens" | "thick-crystal"  (default soft-ripple)
// label:    trigger text  (default "Menu")
// Menu items come from the element's <a> children.
//
// Note: the refraction uses `backdrop-filter: url(#id)`, which is Chromium-only.

const W = 210, H = 200, R = 16;

function displacementMap(border, cblockR) {
  const svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="r" x1="0%" x2="100%"><stop offset="0%" stop-color="#ff0000"/><stop offset="100%" stop-color="#000000"/></linearGradient>
<linearGradient id="b" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#0000ff"/><stop offset="100%" stop-color="#000000"/></linearGradient>
</defs>
<rect width="${W}" height="${H}" fill="black"/>
<rect width="${W}" height="${H}" rx="${R}" fill="url(#r)"/>
<rect width="${W}" height="${H}" rx="${R}" fill="url(#b)" style="mix-blend-mode:screen"/>
<rect x="${border}" y="${border}" width="${W - 2 * border}" height="${H - 2 * border}" rx="${cblockR}" fill="rgb(128,128,128)" style="filter:blur(4px)"/>
</svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

function structuredChroma(mapId, scales) {
  const [a, b, c] = scales;
  return `<feDisplacementMap in="SourceGraphic" in2="${mapId}" xChannelSelector="R" yChannelSelector="B" scale="${a}" result="dR"/>
<feColorMatrix in="dR" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="rC"/>
<feDisplacementMap in="SourceGraphic" in2="${mapId}" xChannelSelector="R" yChannelSelector="B" scale="${b}" result="dG"/>
<feColorMatrix in="dG" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="gC"/>
<feDisplacementMap in="SourceGraphic" in2="${mapId}" xChannelSelector="R" yChannelSelector="B" scale="${c}" result="dB"/>
<feColorMatrix in="dB" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="bC"/>
<feBlend in="rC" in2="gC" mode="screen" result="rg"/><feBlend in="rg" in2="bC" mode="screen"/>`;
}

const MATERIALS = {
  'soft-ripple': {
    filter: `<feTurbulence type="fractalNoise" baseFrequency="0.019 0.020" numOctaves="1" seed="4" result="n"/>
<feGaussianBlur in="n" stdDeviation="1.4" result="nb"/>
<feDisplacementMap in="SourceGraphic" in2="nb" scale="64" xChannelSelector="R" yChannelSelector="G" result="dR"/>
<feColorMatrix in="dR" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="rC"/>
<feDisplacementMap in="SourceGraphic" in2="nb" scale="54" xChannelSelector="R" yChannelSelector="G" result="dG"/>
<feColorMatrix in="dG" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="gC"/>
<feDisplacementMap in="SourceGraphic" in2="nb" scale="46" xChannelSelector="R" yChannelSelector="G" result="dB"/>
<feColorMatrix in="dB" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="bC"/>
<feBlend in="rC" in2="gC" mode="screen" result="rg"/><feBlend in="rg" in2="bC" mode="screen"/>`,
    backdrop: 'blur(0.5px) url(#f) saturate(1.1) brightness(1.02)',
    bg: 'rgba(255,255,255,0.07)',
    overlay: `.menu::before{ content:""; position:absolute; inset:0; pointer-events:none; border-radius:inherit;
      background:linear-gradient(100deg, rgba(20,24,28,0.2) 0%, rgba(20,24,28,0.07) 60%, rgba(20,24,28,0) 92%); }`,
  },
  'edge-lens': {
    filter: () => `<feImage href="${displacementMap(20, 10)}" x="0" y="0" width="100%" height="100%" result="map"/>${structuredChroma('map', [90, 86, 82])}`,
    backdrop: 'url(#f) brightness(1.0) saturate(1.03)',
    bg: 'rgba(255,255,255,0.02)',
    overlay: '',
  },
  'thick-crystal': {
    filter: () => `<feImage href="${displacementMap(24, 22)}" x="0" y="0" width="100%" height="100%" result="map"/>${structuredChroma('map', [48, 45, 43])}`,
    backdrop: 'url(#f) brightness(1.01) saturate(1.05)',
    bg: 'rgba(255,255,255,0.015)',
    overlay: `.menu li{ z-index:2; }
    .menu::after{ content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none; z-index:1; mix-blend-mode:screen;
      background:
        linear-gradient(to bottom, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.03) 6%, transparent 14%),
        radial-gradient(20% 16% at 4% 4%, rgba(255,255,255,0.26), transparent 74%),
        radial-gradient(20% 16% at 96% 4%, rgba(255,255,255,0.22), transparent 74%),
        radial-gradient(18% 15% at 4% 96%, rgba(255,255,255,0.14), transparent 74%),
        radial-gradient(18% 15% at 96% 96%, rgba(255,255,255,0.14), transparent 74%); }`,
  },
};

class GlassNav extends HTMLElement {
  static get observedAttributes() { return ['material', 'label', 'open']; }

  connectedCallback() {
    if (!this._items) {
      this._items = [...this.querySelectorAll('a')].map(a => ({
        href: a.getAttribute('href') || '#',
        text: a.textContent.trim(),
      }));
      this.textContent = '';
    }
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  attributeChangedCallback() { if (this.shadowRoot) this.render(); }

  render() {
    const name = this.getAttribute('material') || 'soft-ripple';
    const m = MATERIALS[name] || MATERIALS['soft-ripple'];
    const label = this.getAttribute('label') || 'Menu';
    const filter = typeof m.filter === 'function' ? m.filter() : m.filter;
    const startOpen = this.hasAttribute('open');
    const items = (this._items || []).map(
      it => `<li><a href="${it.href}">${it.text}</a></li>`
    ).join('');

    this.shadowRoot.innerHTML = `
<svg aria-hidden="true" style="position:absolute;width:0;height:0">
  <filter id="f" color-interpolation-filters="sRGB">${filter}</filter>
</svg>
<style>
  :host{ display:inline-block; font-family:"SF Pro Display","Inter",-apple-system,system-ui,sans-serif; }
  *{ box-sizing:border-box; }
  .nav{ display:flex; align-items:center; }
  .trigger{ appearance:none; background:none; border:0; cursor:pointer; margin:0; padding:6px 10px;
    border-radius:8px; color:#fff; font-family:inherit; font-weight:var(--glass-nav-trigger-weight, 600); line-height:1;
    font-size:var(--glass-nav-trigger-size, 15px); letter-spacing:-0.01em;
    text-shadow:0 1px 5px rgba(0,0,0,.42); }
  .trigger:focus-visible{ outline:2px solid rgba(255,255,255,.75); outline-offset:2px; }
  .wrap{ position:relative; }
  .menu{ position:absolute; top:calc(100% + 8px); left:0; margin:0; list-style:none; padding:5px;
    min-width:210px; border-radius:16px; overflow:hidden;
    backdrop-filter:${m.backdrop}; -webkit-backdrop-filter:${m.backdrop};
    background:${m.bg}; border:1px solid rgba(255,255,255,0.6);
    box-shadow:
      inset 0 1.5px 1px rgba(255,255,255,0.95),
      inset 0 -2px 1.5px rgba(255,255,255,0.62),
      inset 2px 0 1.5px rgba(255,255,255,0.52),
      inset -2px 0 1.5px rgba(255,255,255,0.52),
      inset 0 0 8px rgba(255,255,255,0.14),
      0 14px 34px -12px rgba(0,0,0,0.24);
    opacity:0; visibility:hidden; clip-path:inset(0 34% 84% 34% round 16px);
    transition:opacity .11s cubic-bezier(.4,0,1,1), clip-path .11s cubic-bezier(.4,0,1,1), visibility 0s linear .11s; }
  .menu.open{ opacity:1; visibility:visible; clip-path:inset(0 0 0 0 round 16px);
    transition:opacity .18s cubic-bezier(.16,1,.3,1), clip-path .18s cubic-bezier(.16,1,.3,1); }
  .menu li{ position:relative; z-index:1; }
  .menu a{ display:block; padding:11px 26px; margin:4px 0; border-radius:11px; text-decoration:none;
    white-space:nowrap; color:#fff; cursor:pointer; transition:background .12s ease;
    font-family:inherit; font-weight:500; line-height:1.25; font-size:var(--glass-nav-item-size, 14px);
    letter-spacing:-0.004em; text-shadow:0 1px 3px rgba(0,0,0,.5); }
  .menu li:first-child a{ margin-top:0; } .menu li:last-child a{ margin-bottom:0; }
  .menu a:hover, .menu a:focus-visible{ background:rgba(255,255,255,0.26);
    box-shadow:inset 0 0 0 1px rgba(255,255,255,0.18); outline:none; }
  ${m.overlay}
</style>
<nav class="nav" aria-label="Primary">
  <div class="wrap">
    <button class="trigger" id="trigger" aria-haspopup="true" aria-expanded="${startOpen}" aria-controls="menu">${label}</button>
    <ul class="menu${startOpen ? ' open' : ''}" id="menu">${items}</ul>
  </div>
</nav>`;

    const trigger = this.shadowRoot.getElementById('trigger');
    const menu = this.shadowRoot.getElementById('menu');
    const links = [...menu.querySelectorAll('a')];
    let open = startOpen;
    const setOpen = (v, focus) => {
      open = v;
      trigger.setAttribute('aria-expanded', String(v));
      menu.classList.toggle('open', v);
      if (v && focus === 'first') links[0]?.focus();
      else if (v && focus === 'last') links[links.length - 1]?.focus();
      else if (!v && focus === 'return') trigger.focus();
    };
    trigger.addEventListener('click', () => setOpen(!open));
    trigger.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true, 'first'); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setOpen(true, 'last'); }
      else if (e.key === 'Escape' && open) { e.preventDefault(); setOpen(false, 'return'); }
    });
    menu.addEventListener('keydown', e => {
      const i = links.indexOf(this.shadowRoot.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); links[(i + 1) % links.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); links[(i - 1 + links.length) % links.length].focus(); }
      else if (e.key === 'Home') { e.preventDefault(); links[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); links[links.length - 1].focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); setOpen(false, 'return'); }
      else if (e.key === 'Tab') { setOpen(false); }
    });
    document.addEventListener('pointerdown', e => {
      if (open && !e.composedPath().includes(this)) setOpen(false);
    });
  }
}

customElements.define('glass-nav', GlassNav);
