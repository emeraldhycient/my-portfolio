import { profile, branches } from "./portfolio.js";
import { cover, escapeHTML as esc, icon, mark, repositoryGraph } from "./art.js";
import { setupProfile, updateProjectProfile, projectProfileUnavailable, stackFilterUrl } from "./profile.js";
import { readMigrations } from "./migrations.js";

const $ = (selector) => document.querySelector(selector);
let historyItems = [];
let byId = new Map();
let loadState = "loading";
const serial = (n) => String(n).padStart(3, "0");
const shortDate = (date) => new Intl.DateTimeFormat("en-GB", {day:"numeric", month:"short", year:"numeric", timeZone:"UTC"}).format(new Date(date + "T12:00:00Z"));
const pill = (branch) => `<span class="branch-pill branch-${esc(branch)}">${icon("branch")}${esc(branch)}</span>`;
const address = (item) => "#migration/" + encodeURIComponent(item.id);
const panel = $("#panel");
const filter = $("#branch-filter");
const search = $("#search");
const entries = $("#entries");
const rails = $("#rails");
let displayed = historyItems;
let queuedRailFrame = 0;
let renderedTool = "";

const siteTitle = profile.name + " — " + profile.role;
document.title = siteTitle;
setupProfile();
$("#footer-credit").textContent = profile.name + " / Branchlog";
$("#map-stage").innerHTML = '<p class="map-message">Loading graph…</p>';
const mapHint = $("#map-revision");
function showMapHint(target) {
  const link = target?.closest?.(".graph-node");
  const item = link && byId.get(decodeURIComponent(link.getAttribute("href").slice("#migration/".length)));
  mapHint.textContent = item ? item.title + " / M" + serial(item.number) : historyItems.length ? "Select a node ↗" : "";
}
showMapHint();
$("#map-stage").addEventListener("pointerover", e => showMapHint(e.target));
$("#map-stage").addEventListener("pointerleave", () => showMapHint());
$("#map-stage").addEventListener("focusin", e => showMapHint(e.target));
$("#map-stage").addEventListener("focusout", e => showMapHint(e.relatedTarget));
$("#map-legend").innerHTML = branches.map(b => `<span class="legend-key branch-${esc(b.id)}"><i></i>${esc(b.label)}</span>`).join("");
document.querySelectorAll("[data-icon]").forEach(el => el.innerHTML = icon(el.dataset.icon));
document.querySelectorAll(".brand-mark").forEach(el => el.innerHTML = mark);
branches.forEach(b => filter.add(new Option(b.label, b.id)));

function renderLog() {
  const query = search.value.toLowerCase().trim();
  renderedTool = new URLSearchParams(location.search).get("tech") || "";
  const activeTool = $("#active-tool");
  activeTool.hidden = !renderedTool;
  activeTool.href = stackFilterUrl("");
  activeTool.setAttribute("aria-label", "Clear technology filter: " + renderedTool);
  activeTool.querySelector(".active-tool-label").textContent = renderedTool;
  displayed = historyItems.filter(item => {
    if (renderedTool && !item.stack.includes(renderedTool)) return false;
    const haystack = [item.title, item.summary, item.branch, item.kind, item.hash, "M" + serial(item.number), item.date, ...item.stack].join(" ").toLowerCase();
    return (filter.value === "all" || filter.value === item.branch) && query.split(/\s+/).every(term => haystack.includes(term));
  });
  entries.innerHTML = displayed.map(item => `<li><a class="entry" href="${address(item)}" data-id="${esc(item.id)}" aria-label="Read migration ${serial(item.number)}: ${esc(item.title)}">
    <span class="row-cover">${cover(item)}</span>
    <div class="row-copy"><div class="row-meta"><span>M${serial(item.number)}</span><i class="meta-dot"></i><time datetime="${esc(item.date)}">${esc(shortDate(item.date))}</time><i class="meta-dot hash-dot"></i><span class="meta-hash">${esc(item.hash)}</span><span class="inline-branch branch-${esc(item.branch)}">${esc(item.branch)}</span></div>
      <h3 class="row-title">${esc(item.title)}</h3><p class="row-summary">${esc(item.summary)}</p></div>
    <span class="row-branch">${pill(item.branch)}</span><span class="entry-arrow">${icon("upRight")}</span>
  </a></li>`).join("");
  $("#log-count").textContent = loadState === "ready" ? String(displayed.length).padStart(2,"0") : "—";
  $("#empty").hidden = !historyItems.length || displayed.length > 0;
  $("#result-status").textContent = displayed.length + " of " + historyItems.length + " migrations shown.";
  $("#end-label").textContent = displayed.length === historyItems.length ? "End of log" : "End of results";
  scheduleRails();
}

function scheduleRails() {
  cancelAnimationFrame(queuedRailFrame);
  queuedRailFrame = requestAnimationFrame(drawRails);
}
function drawRails() {
  if (!displayed.length) { rails.replaceChildren(); return; }
  const rect = entries.getBoundingClientRect();
  const width = rails.getBoundingClientRect().width;
  const pos = new Map([...entries.querySelectorAll(".entry")].map(row => {
    const bounds = row.getBoundingClientRect(), item = byId.get(row.dataset.id);
    const lane = Math.max(0, branches.findIndex(b => b.id === item.branch));
    const start = Math.max(7, width * .17);
    const x = start + lane * Math.min(17,(width - start - 8) / Math.max(1, branches.length - 1));
    return [item.id, {x, y: bounds.top - rect.top + bounds.height / 2, item}];
  }));
  const lines = [], dots = [];
  const line = (branch,d) => lines.push(`<path class="rail-line branch-${esc(branch)}" d="${d}"/>`);
  // Only draw edges whose real endpoints are visible; a search must not
  // introduce a parent relationship between otherwise unrelated results.
  for (const a of pos.values()) for (const id of a.item.parents || []) {
      const b = pos.get(id);
      if (!b) continue;
      const span = Math.min(55, (b.y-a.y)*.47);
      const side = a.item.branch === branches[0]?.id ? b : a;
      let d = `M${a.x} ${a.y}`;
      if (a.x === b.x) d += `V${b.y}`;
      else if (a.x < b.x) d += `C${a.x} ${a.y+span*.6} ${b.x} ${a.y+span*.4} ${b.x} ${a.y+span} V${b.y}`;
      else d += `V${b.y-span} C${a.x} ${b.y-span*.4} ${b.x} ${b.y-span*.6} ${b.x} ${b.y}`;
      line(side.item.branch, d);
  }
  for (const {x,y,item} of pos.values()) dots.push(`<g class="branch-${esc(item.branch)}"><circle class="rail-dot" cx="${x}" cy="${y}" r="5.6"/><circle class="rail-pin" cx="${x}" cy="${y}" r="2"/></g>`);
  rails.setAttribute("viewBox", `0 0 ${width} ${rect.height}`);
  rails.innerHTML = lines.join("") + dots.join("");
}
search.addEventListener("input", renderLog);
filter.addEventListener("change", renderLog);
$("#reset").addEventListener("click", () => {
  history.replaceState(null, "", stackFilterUrl(""));
  filter.value = "all";
  search.value = "";
  renderLog();
  search.focus();
});
new ResizeObserver(scheduleRails).observe(entries);
document.fonts.ready.then(scheduleRails);
renderLog();

let opener = null, activePage = "";
const content = $("#panel-content");
const copyButton = (label, what) => `<button type="button" class="copy-button" data-copy="${what}">${icon("copy")}<span>${label}</span></button>`;
const copyStatus = '<p class="copy-status" role="status"></p>';

// Diagrams are site assets keyed by migration slug, so the CMS needs no image field.
const figures = {
  "multimodal-pipeline": {
    src: "./images/multimodal-pipeline.png", width: 2400, height: 1350,
    alt: "Pipeline diagram. A face image, a voice sample and customer data are preprocessed into image, audio and tabular features. The execution layer runs a face match, then a product recommendation, then a voice check; a failed check stops the flow, and the recommendation is shown only after both checks pass.",
  },
};
const isExternal = (url) => /^https?:\/\//i.test(url);
// Only web addresses and site paths are rendered; anything else from the CMS is dropped.
const isSafeLink = (link) => link?.label && typeof link.url === "string" && (isExternal(link.url) || /^\/(?!\/)/.test(link.url));

function projectFigure(item) {
  const figure = Object.hasOwn(figures, item.id) ? figures[item.id] : null;
  if (!figure) return "";
  return `<figure class="note-figure"><a href="${esc(figure.src)}" target="_blank" rel="noopener noreferrer"><img src="${esc(figure.src)}" width="${figure.width}" height="${figure.height}" alt="${esc(figure.alt)}" loading="lazy" decoding="async"></a>
    <figcaption>Diagram · Opens full size in a new tab ${icon("upRight")}</figcaption></figure>`;
}

function projectLinks(item) {
  const links = (item.links || []).filter(isSafeLink);
  if (!links.length) return "";
  return `<section class="note-section note-links"><h3>Links</h3><ul>${links.map(link => isExternal(link.url)
    ? `<li><a href="${esc(link.url)}" target="_blank" rel="noopener noreferrer"><span>${esc(link.label)}</span>${icon("upRight")}</a></li>`
    : `<li><a href="${esc(link.url)}"><span>${esc(link.label)}</span>${icon("right")}</a></li>`).join("")}</ul></section>`;
}

function projectNote(item) {
  const index = historyItems.indexOf(item);
  const older = historyItems[index+1], newer = historyItems[index-1];
  return `<article class="note">
    <div class="note-hero">
      <div><p class="note-kicker">Migration ${serial(item.number)}</p><h2 id="panel-title" tabindex="-1">${esc(item.title)}<span>.</span></h2>
        <p class="note-subtitle">${esc(item.kind)}</p></div><div class="note-cover">${cover(item)}</div>
    </div>
    <p class="note-lede">${esc(item.summary)}</p>
    <div class="note-meta">${pill(item.branch)}<span><time datetime="${esc(item.date)}">${esc(shortDate(item.date))}</time></span><span class="note-hash">${icon("commit")}${esc(item.hash)}</span></div>
    ${item.before || item.after ? `<div class="change-block">${item.before ? `<section><h3><b class="diff-minus" aria-hidden="true">−</b> Before</h3><p>${esc(item.before)}</p></section>` : ""}${item.after ? `<section><h3><b class="diff-plus" aria-hidden="true">+</b> After</h3><p>${esc(item.after)}</p></section>` : ""}</div>` : ""}
    ${projectFigure(item)}
    ${item.notes.length ? `<section class="note-section"><h3>Implementation notes</h3><ul>${item.notes.map(n=>`<li>${esc(n)}</li>`).join("")}</ul></section>` : ""}
    ${projectLinks(item)}
    ${item.stack.length ? `<div class="note-stack"><span class="vis-label">Stack</span>${item.stack.map(s=>`<span class="stack-item">${esc(s)}</span>`).join("")}</div>` : ""}
    <div class="note-actions">${copyButton("Copy link","link")}${copyStatus}</div>
    <nav class="note-nav" aria-label="Other migrations">
      ${older ? `<a href="${address(older)}">${icon("left")}<span><small>Older</small>${esc(older.title)}</span></a>` : "<span></span>"}
      ${newer ? `<a href="${address(newer)}"><span><small>Newer</small>${esc(newer.title)}</span>${icon("right")}</a>` : ""}
    </nav>
  </article>`;
}

function readme() {
  return `<article class="readme"><p class="note-kicker">${esc(profile.handle)} / README.md</p><h2 id="panel-title" tabindex="-1">${esc(profile.name)}<span>.</span></h2>
    <div class="readme-meta"><span>${esc(profile.role)}</span><span>${icon("pin")}${esc(profile.location)}</span></div>
    <div class="readme-prose">${profile.about.map(p=>`<p>${esc(p)}</p>`).join("")}</div>
    <section class="note-section"><h3>Working branches</h3><div class="branch-directory">${branches.map(b=>`<button type="button" data-show-branch="${esc(b.id)}" aria-label="Show migrations on ${esc(b.label)}">${pill(b.id)}<span>${esc(b.description)}</span>${icon("right")}</button>`).join("")}</div></section>
    <div class="note-stack"><span class="vis-label">Focus</span>${profile.focus.map(s=>`<span class="stack-item">${esc(s)}</span>`).join("")}</div>
    <a class="secondary" href="#contact">Get in touch ${icon("upRight")}</a>
    ${profile.sample ? '<p class="sample-note">Preview edition · Profile and projects are fictional.</p>' : ""}
  </article>`;
}

function contact() {
  return `<article class="contact"><p class="note-kicker">Contact / ${esc(profile.handle)}</p><h2 id="panel-title" tabindex="-1">Get in touch<span>.</span></h2>
    <p class="contact-lede">Have a project in mind or a question about a migration? Email is the best way to reach me.</p>
    <div class="contact-address">${icon("mail")}<a href="mailto:${esc(encodeURI(profile.email))}">${esc(profile.email)}</a></div>
    <div class="contact-actions"><a class="primary" href="mailto:${esc(encodeURI(profile.email))}">Open email app ${icon("upRight")}</a>${copyButton("Copy email","email")}</div>${copyStatus}
    ${profile.sample ? '<p class="sample-note">Preview edition · This is a placeholder email address.</p>' : ""}
  </article>`;
}

function isPanelHash(hash) {
  return hash === "#readme" || hash === "#contact" || hash.startsWith("#migration/");
}
function renderPanel() {
  const hash = location.hash;
  if (!isPanelHash(hash)) {
    if (panel.open) {
      panel.close();
      if (opener?.isConnected) opener.focus({preventScroll:true});
      else $("#log-title").focus({preventScroll:true});
    }
    activePage = ""; opener = null; document.title = siteTitle; return;
  }
  if (panel.open && activePage === hash) return;
  activePage = hash;
  let path, html, title;
  if (hash === "#readme") { path = "README.md"; html = readme(); title = profile.name; }
  else if (hash === "#contact") { path = "contact"; html = contact(); title = "Contact"; }
  else {
    let id;
    try { id = decodeURIComponent(hash.slice("#migration/".length)); } catch { id=""; }
    const item = byId.get(id);
    if (loadState !== "ready") {
      path = "migrations";
      title = loadState === "error" ? "Migration unavailable" : "Loading migration";
      html = `<article class="contact"><h2 id="panel-title" tabindex="-1">${title}</h2>${loadState === "error" ? '<button type="button" class="secondary" data-retry-migrations>Retry</button>' : ""}</article>`;
    } else if (item) { path="migrations / "+serial(item.number)+"_"+item.id; html=projectNote(item); title=item.title; }
    else { path="migrations"; title="Migration not found"; html='<article class="contact"><h2 id="panel-title" tabindex="-1">Migration not found<span>.</span></h2><p>This link does not match a project in the log.</p><a href="#log" class="secondary">Explore the log</a></article>'; }
  }
  $("#panel-path").innerHTML = icon(hash === "#readme" ? "file" : hash === "#contact" ? "mail" : "commit") + "<span>"+esc(path)+"</span>";
  content.innerHTML = html;
  document.title = title + " — " + profile.name;
  if (!panel.open) panel.showModal();
  content.scrollTop = 0;
  $("#panel-title").focus({preventScroll:true});
}
function closePanel() {
  if (!panel.open) return;
  if (history.state?.branchlogOverlay) history.back();
  else {
    history.replaceState(null, "", "#log"); renderPanel(); $("#log").scrollIntoView({block:"start"});
  }
}
document.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
  const link = event.target.closest("a");
  if (link?.hasAttribute("data-stack-filter")) {
    event.preventDefault();
    // Entering from the stack shows all projects for that tool. Removing the
    // chip within the log preserves any search or branch filter the reader set.
    if (link.id !== "active-tool") {
      filter.value = "all";
      search.value = "";
    }
    history.pushState(null, "", link.href);
    renderLog();
    $("#log-title").focus({preventScroll: true});
    $("#log").scrollIntoView({block: "start"});
    return;
  }
  const hash = link?.getAttribute("href");
  if (!hash || !isPanelHash(hash)) return;
  event.preventDefault();
  if (panel.open) history.replaceState(history.state, "", hash);
  else { opener=link; history.pushState({branchlogOverlay:true}, "", hash); }
  renderPanel();
});
window.addEventListener("hashchange", renderPanel);
window.addEventListener("popstate", () => {
  const tool = new URLSearchParams(location.search).get("tech") || "";
  if (tool !== renderedTool) renderLog();
});
$("#close-panel").addEventListener("click", closePanel);
panel.addEventListener("cancel", e=>{ e.preventDefault(); closePanel(); });
panel.addEventListener("click", e=>{
  if (e.target !== panel) return;
  const box = panel.getBoundingClientRect();
  if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) closePanel();
});
content.addEventListener("click", async event=>{
  const branchButton = event.target.closest("[data-show-branch]");
  if (branchButton) {
    search.value=""; filter.value=branchButton.dataset.showBranch;
    history.replaceState(null, "", stackFilterUrl("")); renderLog(); renderPanel(); $("#log").scrollIntoView({block:"start"}); filter.focus({preventScroll:true}); return;
  }
  const button = event.target.closest("[data-copy]");
  if (!button) return;
  const value = button.dataset.copy === "email" ? profile.email : location.href;
  const status = content.querySelector(".copy-status");
  try {
    await navigator.clipboard.writeText(value);
    button.innerHTML = icon("check") + "<span>Copied</span>"; status.textContent="Copied to clipboard.";
  } catch {
    status.innerHTML = 'Copy this text: <input class="copy-fallback" type="text" readonly aria-label="Text to copy">';
    const field = status.querySelector("input"); field.value=value; field.focus(); field.select();
  }
});
document.addEventListener("keydown", e=>{
  if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey || panel.open || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
  e.preventDefault(); search.focus(); search.select();
});
async function loadMigrations() {
  const notice = $("#migration-notice");
  loadState = "loading";
  notice.hidden = false;
  notice.textContent = "Loading migrations…";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 14000);
  try {
    const items = await readMigrations(controller.signal);
    historyItems = items;
    byId = new Map(items.map(item => [item.id, item]));
    loadState = "ready";
    updateProjectProfile(items);
    $("#map-stage").innerHTML = items.length ? repositoryGraph(items, branches) : '<p class="map-message">No published migrations yet.</p>';
    notice.hidden = items.length > 0;
    notice.textContent = items.length ? "" : "No published migrations yet.";
  } catch {
    loadState = "error";
    $("#map-stage").innerHTML = '<p class="map-message">Graph unavailable.</p>';
    projectProfileUnavailable();
    notice.innerHTML = 'Migrations could not load. <button class="secondary" type="button" data-retry-migrations>Retry</button>';
  } finally {
    clearTimeout(timer);
    renderLog();
    showMapHint();
    if (location.hash.startsWith("#migration/")) { activePage = ""; renderPanel(); }
  }
}
document.addEventListener("click", event => {
  if (event.target.closest("[data-retry-migrations]") && loadState !== "loading") loadMigrations();
});
renderPanel();
loadMigrations();
