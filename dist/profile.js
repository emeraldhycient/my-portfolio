import { profile, migrations, stackGroups } from "./portfolio.js";
import { escapeHTML as esc, icon } from "./art.js";
import { setupBanner } from "./banner.js";
import { setupTheme } from "./theme.js";

export function stackFilterUrl(tool) {
  const url = new URL(location.href);
  if (tool) url.searchParams.set("tech", tool);
  else url.searchParams.delete("tech");
  url.hash = "log";
  return url.pathname + url.search + url.hash;
}

function techStack() {
  const used = new Set(migrations.flatMap(project => project.stack));
  const listed = new Set(stackGroups.flatMap(group => group.tools));
  const other = [...used].filter(tool => !listed.has(tool)).sort();
  const groups = [...stackGroups, { label: "Other", tools: other }];
  return groups.flatMap(group => {
    const tools = group.tools.filter(tool => used.has(tool));
    if (!tools.length) return [];
    const links = tools.map(tool => `<a href="${esc(stackFilterUrl(tool))}" data-stack-filter aria-label="Show projects using ${esc(tool)}">${esc(tool)}</a>`);
    return [`<div class="tool-group"><dt>${esc(group.label)}</dt><dd>${links.join("")}</dd></div>`];
  }).join("");
}

function resumeDownload() {
  const work = [...migrations].sort((a, b) => b.number - a.number).map(item => [
    item.title + " · " + item.date,
    item.summary,
    item.stack.join(", "),
  ].join("\n"));
  const text = [
    profile.name, profile.role + " · " + profile.location, profile.email, "",
    profile.intro, "", "FOCUS", profile.focus.join(" · "), "", "SELECTED WORK", ...work.map(item => "\n" + item),
  ];
  if (profile.sample) text.push("", "Sample résumé for the Branchlog portfolio preview.");
  return URL.createObjectURL(new Blob([text.join("\n") + "\n"], { type: "text/plain;charset=utf-8" }));
}

function contactRow() {
  const contacts = [
    { label: "GitHub", icon: "github", url: profile.social?.github, external: true },
    { label: "LinkedIn", icon: "linkedin", url: profile.social?.linkedin, external: true },
    { label: "Email", icon: "mail", url: "#contact" },
    { label: "Résumé", icon: "download", url: resumeDownload(), download: profile.handle + "-resume.txt" },
  ];
  return contacts.map(contact => {
    const leadingIcon = `<span class="contact-icon">${icon(contact.icon)}</span>`;
    if (!contact.url) {
      return `<div class="contact-cell pending">${leadingIcon}<span>${esc(contact.label)}<small>Link pending</small></span></div>`;
    }
    const action = contact.download ? `download="${esc(contact.download)}"` : contact.external ? 'target="_blank" rel="noopener noreferrer"' : "";
    const direction = contact.download ? "down" : contact.external ? "upRight" : "right";
    return `<a class="contact-cell" href="${esc(contact.url)}" ${action}>${leadingIcon}<span>${esc(contact.label)}</span><span class="contact-arrow">${icon(direction)}</span></a>`;
  }).join("");
}

export function setupProfile() {
  document.getElementById("profile-name").textContent = profile.name;
  document.getElementById("profile-role").textContent = profile.role;
  document.getElementById("profile-location").textContent = profile.location;
  document.getElementById("profile-handle").textContent = "@" + profile.handle;
  document.getElementById("intro-copy").textContent = profile.intro;
  document.getElementById("about-aside").textContent = profile.aside || "";
  document.getElementById("contact-links").innerHTML = contactRow();
  document.getElementById("tools").innerHTML = techStack();
  setupTheme();
  setupBanner();
}
