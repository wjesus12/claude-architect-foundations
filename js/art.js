/* Arte propio en SVG: «Clay», la mascota pixel naranja, y el destello radial.
   Dibujo original inspirado en la estética de terminal de Claude Code. */
(function () {
  /* Rejilla 16×9. b = cuerpo, h = brillo, s = sombra, a = brazo, l = pierna */
  const BODY = [
    '...hhhhhhhhhh...',
    '...bbbbbbbbbb...',
    '.aabbbbbbbbbbaa.',
    '.aabbbbbbbbbbaa.',
    '...bbbbbbbbbb...',
    '...ssssssssss...'
  ];
  const LEGS = [[4, 'a'], [6, 'b'], [9, 'a'], [11, 'b']];

  const EYES = {
    idle:  { l: [[5, 2], [5, 3]], r: [[10, 2], [10, 3]] },
    happy: { l: [[4, 3], [5, 2], [6, 3]], r: [[9, 3], [10, 2], [11, 3]] },
    sad:   { l: [[4, 2], [5, 3], [6, 3]], r: [[9, 3], [10, 3], [11, 2]] },
    think: { l: [[5, 2], [5, 3]], r: [[10, 3], [11, 3]] },
    wow:   { l: [[5, 1], [5, 2], [5, 3]], r: [[10, 1], [10, 2], [10, 3]] }
  };

  let uidN = 0;

  function mascot({ px = 8, mood = 'idle', cls = '', walk = false, label = 'Clay, la mascota' } = {}) {
    const W = 16, H = 9;
    const id = 'm' + (++uidN);
    let body = '', legs = '';
    BODY.forEach((row, y) => {
      [...row].forEach((c, x) => {
        if (c === '.') return;
        const fill = c === 'h' ? 'var(--m-hi)' : c === 's' ? 'var(--m-lo)' : 'var(--m-body)';
        body += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${fill}"/>`;
      });
    });
    LEGS.forEach(([x, g]) => {
      legs += `<rect class="mascot__leg mascot__leg--${g}" x="${x}" y="6" width="1" height="2" fill="var(--m-lo)"/>`;
    });
    const e = EYES[mood] || EYES.idle;
    const eye = pts => pts.map(([x, y]) => `<rect x="${x}" y="${y}" width="1.02" height="1.02"/>`).join('');
    return `<svg class="mascot mascot--${mood} ${walk ? 'is-walking' : ''} ${cls}" id="${id}" viewBox="0 -1 ${W} ${H + 1}" width="${W * px}" height="${(H + 1) * px}" shape-rendering="crispEdges" role="img" aria-label="${label}">
      <ellipse class="mascot__shadow" cx="8" cy="8.4" rx="5.2" ry=".55"/>
      <g class="mascot__rig">
        <g class="mascot__legs">${legs}</g>
        <g class="mascot__body">${body}
          <g class="mascot__eyes" fill="var(--m-eye)">${eye(e.l)}${eye(e.r)}</g>
        </g>
      </g>
    </svg>`;
  }

  /* Cambia el ánimo de una mascota ya pintada sin re-renderizar el resto */
  function setMood(svg, mood) {
    if (!svg) return;
    const e = EYES[mood] || EYES.idle;
    const g = svg.querySelector('.mascot__eyes');
    if (!g) return;
    g.innerHTML = [...e.l, ...e.r].map(([x, y]) => `<rect x="${x}" y="${y}" width="1.02" height="1.02"/>`).join('');
    svg.classList.remove('mascot--idle', 'mascot--happy', 'mascot--sad', 'mascot--think', 'mascot--wow');
    svg.classList.add('mascot--' + mood);
  }

  function react(svg, kind) {
    if (!svg) return;
    const cls = kind === 'jump' ? 'is-jumping' : kind === 'shake' ? 'is-shaking' : 'is-dancing';
    svg.classList.remove('is-jumping', 'is-shaking', 'is-dancing');
    void svg.getBoundingClientRect();
    svg.classList.add(cls);
    setMood(svg, kind === 'shake' ? 'sad' : 'happy');
    clearTimeout(svg._t);
    svg._t = setTimeout(() => { svg.classList.remove(cls); setMood(svg, 'idle'); }, kind === 'dance' ? 2400 : 1100);
  }

  /* Destello radial: rayos de largo irregular, como trazados a mano */
  function spark({ size = 64, rays = 12, cls = '', seed = 7 } = {}) {
    let s = seed;
    const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    let lines = '';
    for (let i = 0; i < rays; i++) {
      const a = (i / rays) * Math.PI * 2 + (rnd() - .5) * .12;
      const r1 = 7 + rnd() * 3, r2 = 30 + rnd() * 16;
      const w = 2.8 + rnd() * 1.4;
      lines += `<line class="spark__ray" style="--d:${(i * .13).toFixed(2)}s" x1="${(50 + Math.cos(a) * r1).toFixed(1)}" y1="${(50 + Math.sin(a) * r1).toFixed(1)}" x2="${(50 + Math.cos(a) * r2).toFixed(1)}" y2="${(50 + Math.sin(a) * r2).toFixed(1)}" stroke-width="${w.toFixed(1)}"/>`;
    }
    return `<svg class="spark ${cls}" viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true"><g class="spark__spin">${lines}</g></svg>`;
  }

  /* Anillo de progreso animado */
  function ring({ value = 0, size = 92, stroke = 8, label = '', sub = '', tone = 'accent' } = {}) {
    const r = (size - stroke) / 2, c = 2 * Math.PI * r;
    const v = Math.max(0, Math.min(1, value));
    return `<svg class="ring ring--${tone}" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${label} ${Math.round(v * 100)}%">
      <circle class="ring__track" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}"/>
      <circle class="ring__bar" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}"
        stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${c.toFixed(2)}" style="--to:${(c * (1 - v)).toFixed(2)}"
        transform="rotate(-90 ${size / 2} ${size / 2})"/>
      <text x="50%" y="${sub ? '47%' : '53%'}" class="ring__val">${label}</text>
      ${sub ? `<text x="50%" y="66%" class="ring__sub">${sub}</text>` : ''}
    </svg>`;
  }

  /* Barra ASCII al estilo de la terminal: ████████░░░░ */
  function bar(v, width = 16) {
    const n = Math.round(Math.max(0, Math.min(1, v)) * width);
    return `<span class="abar"><span class="abar__on">${'█'.repeat(n)}</span><span class="abar__off">${'░'.repeat(width - n)}</span></span>`;
  }

  CAF.Art = { mascot, setMood, react, spark, ring, bar };
})();
