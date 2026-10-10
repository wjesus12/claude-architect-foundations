/* Escenas SVG animadas: una por dominio + iconos de escenario.
   Cada escena dibuja el MECANISMO real del dominio, no decoración genérica. */
(function () {
  const svg = (body, cls, label) =>
    `<svg class="scene ${cls}" viewBox="0 0 360 200" role="img" aria-label="${label}" preserveAspectRatio="xMidYMid meet">${body}</svg>`;

  /* D1 — el bucle agéntico: request → stop_reason → tool → tool_result → request… */
  function agents() {
    const loop = 'M70,52 H290 A30,30 0 0 1 320,82 V118 A30,30 0 0 1 290,148 H70 A30,30 0 0 1 40,118 V82 A30,30 0 0 1 70,52 Z';
    const node = (x, y, t, sub, cls = '') => `<g class="sc-node ${cls}" transform="translate(${x},${y})">
        <rect x="-58" y="-17" width="116" height="34" rx="7"/>
        <text y="-1" class="sc-t">${t}</text><text y="11" class="sc-s">${sub}</text></g>`;
    return svg(`
      <path d="${loop}" class="sc-track"/>
      <path d="${loop}" class="sc-flow"/>
      ${node(92, 52, 'messages.create', 'history + tools')}
      ${node(268, 52, 'stop_reason', '<tspan class="sc-cycle">"tool_use"</tspan>', 'sc-node--hot')}
      ${node(268, 148, 'run tool', 'lookup_order()')}
      ${node(92, 148, 'tool_result', 'append → history')}
      <circle r="5" class="sc-token"><animateMotion dur="5.6s" repeatCount="indefinite" path="${loop}" rotate="auto"/></circle>
      <circle r="9" class="sc-token-halo"><animateMotion dur="5.6s" repeatCount="indefinite" path="${loop}"/></circle>
      <g transform="translate(180,90)">
        <text class="sc-center">loop while</text>
        <text y="16" class="sc-center sc-center--code">stop_reason == "tool_use"</text>
        <text y="34" class="sc-center sc-center--end">end_turn → exit ✓</text>
      </g>`, 'scene--agents', 'Diagrama animado del bucle agéntico');
  }

  /* D2 — MCP: el agente llama tools a través del servidor; una vuelve con isError */
  function tools() {
    const tl = ['get_customer', 'lookup_order', 'process_refund', 'escalate_to_human'];
    let lines = '', boxes = '', packets = '';
    tl.forEach((t, i) => {
      const y = 30 + i * 38;
      const p = `M196,100 C226,100 222,${y} 246,${y}`;
      lines += `<path d="${p}" class="sc-wire"/>`;
      boxes += `<g class="sc-tool ${i === 2 ? 'sc-tool--err' : ''}" transform="translate(246,${y - 12})"><rect width="108" height="24" rx="6"/><text x="7" y="16" class="sc-code">${t}</text></g>`;
      const err = i === 2;
      packets += `<circle r="3.6" class="sc-pkt"><animateMotion dur="3.2s" begin="${(i * .8).toFixed(1)}s" repeatCount="indefinite" path="${p}" keyPoints="0;1;0" keyTimes="0;.5;1" calcMode="linear"/></circle>`;
      if (err) packets += `<circle r="3.6" class="sc-pkt sc-pkt--err"><animateMotion dur="3.2s" begin="1.6s" repeatCount="indefinite" path="${p}" keyPoints="1;0" keyTimes="0;1" calcMode="linear"/></circle>`;
    });
    return svg(`
      <g class="sc-agent" transform="translate(18,78)"><rect width="78" height="44" rx="8"/><text x="39" y="20" class="sc-t">agent</text><text x="39" y="33" class="sc-s">tool_choice:auto</text></g>
      <path d="M96,100 H124" class="sc-wire sc-wire--bold"/>
      <circle r="3.6" class="sc-pkt"><animateMotion dur="1.6s" repeatCount="indefinite" path="M96,100 H124"/></circle>
      <g class="sc-server" transform="translate(124,70)"><rect width="72" height="60" rx="10"/><text x="36" y="27" class="sc-t">MCP</text><text x="36" y="42" class="sc-s">server</text></g>
      ${lines}${boxes}${packets}
      <g class="sc-errtag" transform="translate(14,166)"><rect width="196" height="24" rx="6"/><text x="8" y="17" class="sc-code">{ isError: true, isRetryable: false }</text></g>
    `, 'scene--tools', 'Diagrama animado de un servidor MCP enrutando llamadas a tools');
  }

  /* D3 — el árbol de configuración de Claude Code se escribe línea a línea */
  function code() {
    const rows = [
      ['~/repo', 'sc-dim'],
      ['├─ CLAUDE.md', ''],
      ['├─ .mcp.json', '', '${GITHUB_TOKEN}'],
      ['└─ .claude/', ''],
      ['   ├─ rules/testing.md', '', 'paths: ["**/*.test.*"]'],
      ['   ├─ skills/review/SKILL.md', '', 'context: fork'],
      ['   └─ commands/deploy.md', '', '/deploy']
    ];
    const body = rows.map(([t, c, note], i) => `<g class="sc-row" style="--i:${i}">
        <text x="22" y="${42 + i * 20}" class="sc-code ${c}">${t}</text>
        ${note ? `<text x="214" y="${42 + i * 20}" class="sc-note">${note}</text>` : ''}</g>`).join('');
    return svg(`
      <rect x="8" y="12" width="344" height="176" rx="10" class="sc-panel"/>
      ${body}
      <rect x="22" y="174" width="8" height="12" class="sc-cursor"/>
      <g class="sc-mode" transform="translate(262,166)"><rect width="80" height="20" rx="10"/><text x="40" y="14" class="sc-s"><tspan class="sc-mode__a">⏸ plan mode</tspan></text></g>
    `, 'scene--code', 'Árbol animado de archivos de configuración de Claude Code');
  }

  /* D4 — salida estructurada: el JSON se rellena y el schema lo valida campo a campo */
  function prompts() {
    const rows = [
      ['{', '', ''],
      ['  "invoice_id": ', '"INV-0042"', 'ok'],
      ['  "total": ', '1280.50', 'ok'],
      ['  "currency": ', '"PEN"', 'ok'],
      ['  "due_date": ', 'null', 'null'],
      ['  "category": ', '"other"', 'ok'],
      ['}', '', '']
    ];
    const body = rows.map(([k, v, st], i) => `<g class="sc-row" style="--i:${i}">
      <text x="24" y="${38 + i * 21}" class="sc-code"><tspan class="sc-key">${k}</tspan><tspan class="sc-val ${st === 'null' ? 'sc-val--null' : ''}">${v}</tspan></text>
      ${st ? `<text x="214" y="${38 + i * 21}" class="sc-check ${st === 'null' ? 'sc-check--null' : ''}">${st === 'null' ? '∅ nullable' : '✓ schema'}</text>` : ''}</g>`).join('');
    return svg(`
      <rect x="8" y="12" width="344" height="176" rx="10" class="sc-panel"/>
      ${body}
      <g class="sc-chip" transform="translate(236,160)"><rect width="110" height="22" rx="11"/><text x="55" y="15" class="sc-s">tool_choice: "any"</text></g>
    `, 'scene--prompts', 'Animación de una extracción JSON validada por schema');
  }

  /* D5 — la ventana de contexto se llena, /compact la vacía, los case facts se quedan */
  function context() {
    const blocks = [
      ['system', 26, 'var(--info)'],
      ['case facts', 34, 'var(--clay)'],
      ['turn', 22, 'var(--line-2)'],
      ['tool_result ×40 fields', 96, 'var(--violet)'],
      ['turn', 22, 'var(--line-2)'],
      ['tool_result', 70, 'var(--violet)']
    ];
    let x = 24, rects = '';
    blocks.forEach(([t, w, c], i) => {
      const keep = i < 2;
      const small = keep ? w : Math.max(6, Math.round(w * .18));
      rects += `<g><rect x="${x}" y="70" height="56" rx="4" fill="${c}" class="sc-ctx ${keep ? 'sc-ctx--keep' : ''}" width="${w}">
          ${keep ? '' : `<animate attributeName="width" values="0;${w};${w};${small};${small};0" keyTimes="0;.25;.6;.7;.95;1" dur="7s" begin="${(i * .25).toFixed(2)}s" repeatCount="indefinite"/>`}
        </rect>
        ${w > 30 ? `<text x="${x + 6}" y="102" class="sc-ctx__t ${keep ? '' : 'sc-ctx__t--fade'}">${t}</text>` : ''}</g>`;
      x += w + 3;
    });
    return svg(`
      <text x="24" y="50" class="sc-s sc-left">context window</text>
      <text x="336" y="50" class="sc-s sc-right sc-ctx__meter">200k</text>
      <rect x="20" y="66" width="320" height="64" rx="8" class="sc-ctx__frame"/>
      ${rects}
      <g class="sc-compact" transform="translate(130,146)"><rect width="100" height="26" rx="13"/><text x="50" y="17" class="sc-code sc-mid">/compact</text></g>
      <text x="24" y="182" class="sc-s sc-left sc-pin">📌 case facts persist outside the summary</text>
    `, 'scene--context', 'Animación de una ventana de contexto que se compacta conservando los case facts');
  }

  const BY_DOMAIN = { 1: agents, 2: tools, 3: code, 4: prompts, 5: context };

  /* Iconos de escenario (trazo fino) */
  const ICONS = {
    support: '<path d="M4 12a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2h-1v-6h3M4 12v4a2 2 0 0 0 2 2h1v-6H4"/>',
    code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14"/>',
    research: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5M8.5 11h5M11 8.5v5"/>',
    devtools: '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M7 9l3 2.5L7 14M12 14h5"/>',
    ci: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="12" r="2.5"/><path d="M6 8.5v7M8.3 7.2c4 .8 7 2 7.7 3.5M8.3 16.8c4-.8 7-2 7.7-3.5"/>',
    extract: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 15.5h6M9 9h2"/>'
  };
  const icon = (k, size = 22) => `<svg class="ico" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k] || ''}</svg>`;

  CAF.Scenes = { forDomain: id => (BY_DOMAIN[id] || agents)(), icon, agents, tools, code, prompts, context };
})();
