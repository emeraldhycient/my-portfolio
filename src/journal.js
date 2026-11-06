import {toHTML} from "@portabletext/to-html";
import {escapeHTML as esc, icon, mark} from "../dist/art.js";
import {profile} from "../dist/portfolio.js";
import {setupTheme} from "../dist/theme.js";
import {getJournalEntry, listJournal} from "./journal-data.js";

const $ = selector => document.querySelector(selector);
const kinds = {all:"All entries",work:"Work",experience:"Experience",note:"Notes"};
const kindName = kind => kind === "note" ? "Note" : kinds[kind] || "Note";
const activeKind = () => {
  const value = new URLSearchParams(location.search).get("kind");
  return value && Object.hasOwn(kinds,value) ? value : "all";
};
const format = (date, options) => new Intl.DateTimeFormat("en-GB",{...options,timeZone:"UTC"}).format(new Date(date));
const month = date => format(date,{month:"long",year:"numeric"});
const clock = date => format(date,{hour:"2-digit",minute:"2-digit",hourCycle:"h23"});
const entryHash = entry => "#entry/" + encodeURIComponent(entry.slug);
let entries = [];
let request;
let more = false;
let preview = false;
const list = $("#stream-list"), article = $("#entry-view"), stream = $("#stream-view");
const loadMore = $("#load-more");
const backUrl = () => location.pathname + location.search + "#stream";

document.querySelectorAll(".brand-mark").forEach(el => el.innerHTML=mark);
$("#journal-credit").textContent = profile.name + " / Journal";
setupTheme();

function renderFilters() {
  const kind = activeKind();
  $("#kind-nav").innerHTML = Object.entries(kinds).map(([key,label]) => {
    const url = new URL(location.href);
    url.hash = "";
    if (key === "all") url.searchParams.delete("kind"); else url.searchParams.set("kind",key);
    return `<a href="${esc(url.pathname + url.search)}" ${kind===key ? 'aria-current="page"' : ""}>${label}</a>`;
  }).join("");
}
function renderList() {
  const groups = new Map();
  for (const entry of entries) {
    const label = month(entry.publishedAt);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(entry);
  }
  list.innerHTML = [...groups.entries()].map(([label,items]) => `<section class="month-group">
    <h2>${esc(label)}</h2><ol>${items.map(item=>`<li><a class="stream-event" href="${entryHash(item)}">
      <time datetime="${esc(item.publishedAt)}"><span>${esc(format(item.publishedAt,{day:"2-digit",month:"short"}))}</span><small>${esc(clock(item.publishedAt))} UTC</small></time>
      <span class="stream-track kind-${esc(item.kind)}" aria-hidden="true"><i></i></span>
      <span class="event-copy"><span class="event-kind kind-${esc(item.kind)}">${esc(kindName(item.kind))}</span>
        <strong>${esc(item.title)}</strong><span class="event-summary">${esc(item.summary || "")}</span></span><span class="event-arrow">${icon("right")}</span>
    </a></li>`).join("")}</ol></section>`).join("");
  if (!entries.length) list.innerHTML = '<p class="journal-message">No entries in this category yet.</p>';
  $("#stream-source").textContent = preview ? "Sample stream" : "";
  $("#journal-status").textContent = entries.length + " journal entries shown.";
  loadMore.hidden = !more;
}
function showArticle(entry) {
  const back = `<a class="section-link stream-back" href="${esc(backUrl())}">← Journal stream</a>`;
  $("#journal-status").textContent = entry ? "Reading " + entry.title : "Entry unavailable.";
  if (!entry) {
    article.innerHTML = back + "<h1>Entry unavailable.</h1><p>This journal link has no published entry.</p>";
    return;
  }
  const date = format(entry.publishedAt,{day:"numeric",month:"long",year:"numeric"});
  article.innerHTML = `${back}<div class="article-meta"><span class="event-kind kind-${esc(entry.kind)}">${esc(kindName(entry.kind))}</span>
    <time datetime="${esc(entry.publishedAt)}">${esc(date)} · ${esc(clock(entry.publishedAt))} UTC</time>${entry.example?"<span>Sample entry</span>":""}</div>
    <h1>${esc(entry.title)}</h1><p class="article-summary">${esc(entry.summary||"")}</p>
    <div class="article-body">${toHTML(Array.isArray(entry.body) ? entry.body : [])}</div>${back}`;
  document.title = entry.title + " — Branchlog Journal";
}
function showError(container) {
  container.innerHTML = '<div class="journal-message"><p>The journal could not load. Try again to read the published entries.</p><button type="button" class="secondary" data-retry>Retry</button></div>';
}
async function readRoute(append = false) {
  request?.abort();
  const controller = new AbortController();
  request = controller;
  const timeout = setTimeout(() => controller.abort(), 14000);
  const reading = location.hash.startsWith("#entry/");
  const target = reading ? article : list;
  stream.hidden = reading;
  article.hidden = !reading;
  document.title = "Journal — Branchlog";
  target.setAttribute("aria-busy","true");
  renderFilters();
  if (!append) {
    entries = []; more = false; preview = false;
    loadMore.hidden = true; $("#stream-source").textContent="";
    target.innerHTML = '<p class="journal-message">Loading entries…</p>';
  }
  loadMore.disabled = true;
  try {
    if (reading) {
      let slug;
      try { slug = decodeURIComponent(location.hash.slice(7)); } catch { slug = ""; }
      const entry = slug ? await getJournalEntry(slug, controller.signal) : null;
      if (request !== controller) return;
      showArticle(entry);
      const heading = article.querySelector("h1");
      heading.tabIndex = -1;
      heading.focus({preventScroll:true});
      window.scrollTo({top:0,behavior:"instant"});
    } else {
      const result = await listJournal(activeKind(), append ? entries.at(-1) : null, controller.signal);
      if (request !== controller) return;
      const seen = new Set(entries.map(entry=>entry._id));
      entries.push(...result.entries.filter(entry=>!seen.has(entry._id)));
      more = result.more; preview = result.sample;
      renderList();
      if (!append && location.hash === "#stream") $("#journal-main").scrollIntoView({block:"start"});
    }
  } catch {
    if (request !== controller) return;
    if (append) {
      $("#journal-status").textContent = "Earlier entries could not load. Try loading them again.";
      loadMore.textContent = "Retry earlier entries";
    } else showError(target);
  } finally {
    clearTimeout(timeout);
    if (request === controller) {
      target.removeAttribute("aria-busy");
      loadMore.disabled = false;
    }
  }
}
loadMore.addEventListener("click", () => { loadMore.textContent="Load earlier entries"; readRoute(true); });
document.addEventListener("click", event => {
  if (event.target.closest("[data-retry]")) readRoute();
  const jump = event.target.closest('a[href="#top"], a[href="#journal-main"]');
  if (!jump || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const target = document.getElementById(jump.hash.slice(1));
  target.tabIndex = -1;
  target.focus({preventScroll:true});
  target.scrollIntoView({block:"start"});
});
window.addEventListener("hashchange", () => readRoute());
readRoute();
