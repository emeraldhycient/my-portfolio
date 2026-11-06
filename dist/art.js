// The graph, project covers, and icons are vectors. No image service or runtime
// dependency is needed; every project has a fallback cover.
export const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[c]);

const icons = {
  down: '<path d="M12 4v15m-6-6 6 6 6-6"/>',
  up: '<path d="M12 20V5m-6 6 6-6 6 6"/>',
  right: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  left: '<path d="M20 12H5m6-6-6 6 6 6"/>',
  upRight: '<path d="M5 19 18 6M7 6h11v11"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  branch: '<circle cx="6" cy="5" r="2.3"/><circle cx="6" cy="19" r="2.3"/><circle cx="18" cy="6" r="2.3"/><path d="M6 7.5v9m0-3c7 0 12-1.8 12-5"/>',
  topology: '<path d="M3 13h18M6 13c3.5 0 3-6 7-6h3"/><circle cx="5" cy="13" r="2.5"/><circle cx="18" cy="7" r="2.5"/><circle cx="18" cy="13" r="2.5"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  commit: '<path d="M2 12h5m10 0h5"/><circle cx="12" cy="12" r="4.2"/>',
  undo: '<path d="M3 10h10a6 6 0 1 1 0 12m-5-17-5 5 5 5" transform="translate(0 -2)"/>',
  file: '<path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6m-6 4h5"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.4"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/>',
  github: '<path d="M9 21v-3.7c-3.7.9-4.8-1.5-5.3-2.5m10.8 6.2v-3.5c0-.9-.3-1.5-.7-1.9 2.5-.3 5-1.3 5-5.6a4.4 4.4 0 0 0-1.2-3.1c.1-.4.5-1.6-.1-3.2 0 0-1-.3-3.2 1.2a11.4 11.4 0 0 0-5.8 0C6.3 3.4 5.3 3.7 5.3 3.7c-.6 1.6-.2 2.8-.1 3.2A4.4 4.4 0 0 0 4 10c0 4.2 2.5 5.3 5 5.6-.4.4-.7 1-.7 1.8"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="7.4" cy="8" r=".8" fill="currentColor"/><path d="M7.4 11v6m4-6v6m0-3.8c0-2.9 5-3.1 5 0V17"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1.8v2.4m0 15.6v2.4M1.8 12h2.4m15.6 0h2.4M4.7 4.7l1.7 1.7m11.2 11.2 1.7 1.7M4.7 19.3l1.7-1.7M17.6 6.4l1.7-1.7"/>',
  moon: '<path d="M19.8 15.2A8.4 8.4 0 0 1 8.8 4.2a8.4 8.4 0 1 0 11 11Z"/>',
  play: '<path d="M8 5.5v13l10-6.5z" fill="currentColor" stroke="none"/>',
  pause: '<path d="M8.5 6v12m7-12v12" stroke-width="3"/>',
  link: '<path d="m10 13 4-4m-5 1-2 2a4 4 0 0 0 6 6l2-2m-6-5 2-2a4 4 0 0 1 6 6l-2 2"/>',
};
export const icon = (name) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${icons[name] || ""}</svg>`;
export const mark = '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 23V8m0 10c8 0 13-3 13-10"/><circle cx="9" cy="24" r="2.4"/><circle cx="9" cy="7" r="2.4"/><circle cx="22" cy="7" r="2.4"/></g></svg>';

// Keep a branch's own lane up to the fork or merge rather than cutting
// diagonally across the figure. Uses the same parent IDs as the vertical log.
export function repositoryGraph(items, branches) {
  const order = [...items].sort((a, b) => a.number - b.number);
  const graphWidth = Math.max(535, 80 + 91 * (order.length - 1));
  // One lane per branch, in branch order: main sits second from the top so the
  // trunk reads between work above and ml/ventures below. Lanes ≥ 100 put the
  // hash label under the node; the viewBox leaves room for the lowest label.
  const lanes = [103, 48, 158, 213];
  const height = 244;
  const laneY = (b) => lanes[Math.max(0, branches.findIndex((it) => it.id === b)) % lanes.length];
  const points = new Map(order.map((it, i) => [it.id, {
    x: order.length === 1 ? 267 : 38 + ((graphWidth - 80) * i) / Math.max(1, order.length - 1), y: laneY(it.branch), item: it,
  }]));
  const primary = branches[0]?.id;
  const paths = [];
  for (const target of points.values()) {
    for (const id of target.item.parents || []) {
      const start = points.get(id);
      if (!start) continue;
      const { x: x1, y: y1 } = start;
      const { x: x2, y: y2 } = target;
      const merge = target.item.branch === primary && start.item.branch !== primary;
      const color = merge ? start.item.branch : target.item.branch;
      const span = Math.min(105, Math.max(12, x2 - x1));
      const curve = y1 === y2 ? `M${x1} ${y1}H${x2}`
        : merge ? `M${x1} ${y1} H${x2-span} C${x2-span+span*.48} ${y1} ${x2-span*.48} ${y2} ${x2} ${y2}`
          : `M${x1} ${y1} C${x1+span*.48} ${y1} ${x1+span*.52} ${y2} ${x1+span} ${y2} H${x2}`;
      paths.push(`<path class="map-line branch-${escapeHTML(color)}" d="${curve}"/>`);
    }
  }
  const last = order.at(-1);
  const nodes = [...points.values()].map(({x, y, item}) => {
    const head = item === last;
    const hashY = y < 100 ? y - 16 : y + 25;
    return `<a class="graph-node branch-${escapeHTML(item.branch)}" href="#migration/${encodeURIComponent(item.id)}" aria-label="Open ${escapeHTML(item.title)}, migration ${item.number}">
      <title>${escapeHTML(item.title)} · ${escapeHTML(item.hash)}</title>
      <circle class="node-hit" cx="${x}" cy="${y}" r="23"/>
      <circle class="node-halo" cx="${x}" cy="${y}" r="13"/>
      ${head ? `<circle class="head-orbit" cx="${x}" cy="${y}" r="13"/>` : ""}
      <circle class="node-dot" cx="${x}" cy="${y}" r="${head ? 7 : 5.8}"/>
      <circle class="node-pin" cx="${x}" cy="${y}" r="1.9"/>
      <text class="map-hash" x="${x}" y="${hashY}" text-anchor="middle">${escapeHTML(item.hash)}</text>
      ${head ? `<g class="head-flag"><path d="M${x} ${y-16}v-11"/><rect x="${x-24}" y="${y-48}" width="48" height="21" rx="3"/><text x="${x}" y="${y-33}" text-anchor="middle">HEAD</text></g>` : ""}
    </a>`;
  });
  const first = [...points.values()][0];
  const head = points.get(last?.id);
  const tail = first && head ? `<path class="map-tail" d="M0 ${first.y}H${first.x} M${head.x} ${head.y}H${graphWidth}"/>` : "";
  const width = graphWidth > 535 ? ` style="--graph-width:${graphWidth / 535 * 100}%"` : "";
  return `<svg viewBox="0 0 ${graphWidth} ${height}"${width} role="group" aria-label="Project history, oldest on the left"><g aria-hidden="true">${tail}${paths.join("")}</g>${nodes.join("")}</svg>`;
}

const range = (n, f) => Array.from({length:n}, (_, i) => f(i)).join("");
// Seven small editions of a print series: each uses the subject of the project
// as its drawing, from parallel delivery routes to acoustic waveforms.
const drawings = {
  relay: () => `<g class="print-ink" fill="none" stroke-width="2.7">${range(14,i=>{
    const x=72+i*5.9, y=119+i*4.3, top=3+i*4.3;
    return `<path d="M-12 ${y}H${x}c23 0 23-5 39-21l68-68c14-14 22-18 42-18h100" transform="translate(0 ${top-4-i*4.3})"/>`;
  })}</g><g class="print-fill"><path d="M277 141h19v-19l-5 0v10l-14-14-4 4 14 14h-10z"/></g>`,
  formwork: () => `<g class="cube" stroke-linejoin="round" stroke-width="1.7">${[37,19,1].map((offset,i)=>`<g transform="translate(0 ${offset})"><path class="cube-face-b" d="M86 76 169 31l83 45-83 45z"/><path class="cube-face-c" d="M86 76l83 45v9L86 85z"/><path class="cube-face-a" d="m169 121 83-45v9l-83 45z"/>${i===2 ? `<path fill="none" d="m107 65 82 45m-61-56 82 45m-61-56 82 45m-124 0 82-45m-61 56 82-45m-61 56 82-45"/>` : ""}</g>`).join("")}</g>`,
  oscillator: () => `<g class="wave-grid">${range(12,i=>`<path d="M${i*30} 0v176"/>`)}${range(7,i=>`<path d="M0 ${i*29}h320"/>`)}</g><g class="wave" fill="none" stroke-width="1.65">${range(7,j=>{
    const pts=Array.from({length:178},(_,i)=>{const x=i*2-14;const env=Math.sin(Math.PI*Math.max(0,Math.min(1,(x+12)/340)))**1.2;return `${x},${(88+Math.sin((x-40)/27+0.23*j)*env*(56-j*3)+Math.sin(x/14)*4).toFixed(2)}`;}).join(" ");
    return `<polyline points="${pts}"/>`;
  })}</g>`,
  wayfinder: () => `<g class="contours" fill="none" stroke-width="1.8">${range(18,j=>{const s=16+j*7;const pts=Array.from({length:120},(_,i)=>{const t=i/120*Math.PI*2;const r=s*(1+.13*Math.sin(t*3+.5)+.08*Math.cos(t*5));return `${(158+r*Math.cos(t)*1.48).toFixed(1)},${(81+r*Math.sin(t)*.91).toFixed(1)}`;}).join(" ");return `<polygon points="${pts}"/>`;})}</g><path class="trail" fill="none" stroke-width="3" stroke-dasharray="4 3" d="M50 142q32-79 73-49t47-17q7-24 42-6t55-38"/><g class="trail-end"><circle cx="50" cy="142" r="5"/><circle cx="267" cy="32" r="5"/></g>`,
  tracekit: () => `<g class="trace-guides">${range(11,i=>`<path d="M${30+i*26} 37v112"/>`)}</g><g class="trace-bars">${[[32,49,241],[49,68,126],[76,86,74],[125,103,72],[162,121,94],[225,137,33]].map(([x,y,w],i)=>`<rect class="trace-${i%3}" x="${x}" y="${y}" width="${w}" height="7" rx="1"/>`).join("")}</g>`,
  scratchpad: () => `<g class="notebook" stroke-width="2.1" stroke-linejoin="round" transform="rotate(-10 160 88)"><path class="note-edge" d="M88 30h140v123H88z"/><path class="note-face" d="M83 24h140v123H83z"/><path class="note-spine" d="M102 24v123"/>${range(6,i=>`<path class="note-ruling" d="M111 ${49+i*13}h96"/>`)}<path class="note-type" d="m139 66-12 9 12 9m37-18 12 9-12 9m-9-25-12 34"/><path class="bookmark" d="M191 24v30l6-5 6 5V24z"/></g>`,
  // Three input streams (image, audio, tabular) converge on one gate, then a single output.
  pipeline: () => {
    const lanes = [42, 88, 134];
    const streams = lanes.map(y => range(5, i => {
      const o = (i - 2) * 3.4, m = 88 + o * 0.7;
      return `<path d="M-12 ${y + o}H${74 + i * 3}C${116 + i * 2} ${y + o} ${118} ${m} ${150} ${m}"/>`;
    })).join("");
    const out = range(5, i => `<path d="M196 ${88 + (i - 2) * 3.4 * 0.7}H${226 + i * 9}"/>`);
    return `<g class="print-ink" fill="none" stroke-width="1.6">${streams}${out}<path d="M196 88H296" stroke-width="2.8"/></g>
  <g class="print-fill">${lanes.map(y => `<rect x="54" y="${y - 9}" width="18" height="18" rx="2"/>`).join("")}
  <rect x="150" y="65" width="46" height="46" rx="3"/><path d="M296 79l15 9-15 9z"/></g>`;
  },
};
let edition = 0;
export function cover(item) {
  const key = Object.hasOwn(drawings,item.art) ? item.art : "scratchpad";
  const serial = String(item.number).padStart(3, "0");
  return `<svg class="cover art-${key}" viewBox="0 0 320 176" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" data-print="${++edition}">
    <rect class="print-paper" width="320" height="176"/>${drawings[key]()}
    <g class="print-caption"><text x="13" y="19">PL. ${serial}</text><text x="307" y="164" text-anchor="end">HI / ${String(item.number).padStart(2,"0")}</text></g>
  </svg>`;
}
