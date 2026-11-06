import {icon} from "./art.js";

export function setupTheme() {
  const html = document.documentElement;
  const toggle = document.getElementById("theme-toggle");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  function update() {
    const dark = html.dataset.theme === "dark";
    const label = dark ? "Switch to light theme" : "Switch to dark theme";
    toggle.setAttribute("aria-label", label);
    toggle.title = label;
    toggle.innerHTML = icon(dark ? "sun" : "moon");
    themeColor.content = themeColor.dataset[dark ? "dark" : "light"];
  }
  update();
  toggle.addEventListener("click", () => {
    html.dataset.theme = html.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem("branchlog-theme", html.dataset.theme); } catch { /* Storage is optional. */ }
    update();
  });
}
