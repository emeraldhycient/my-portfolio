import { icon } from "./art.js";

export function setupBanner() {
  const video = document.getElementById("coast-motion");
  const button = document.getElementById("banner-control");
  if (!video.canPlayType("video/mp4")) return;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let pausedByUser = false;
  try { pausedByUser = sessionStorage.getItem("branchlog-pause-banner") === "yes"; } catch { /* Optional preference. */ }
  let wantsMotion = !reduced.matches && !pausedByUser;
  let inView = false;
  let failed = false;

  function showControl(playing) {
    const label = playing ? "Pause banner animation" : "Play banner animation";
    button.innerHTML = icon(playing ? "pause" : "play");
    button.setAttribute("aria-label", label);
    button.title = label;
  }
  function syncPlayback() {
    if (failed) return;
    if (!wantsMotion || !inView || document.hidden) {
      video.pause();
      return;
    }
    if (!video.hasAttribute("src")) video.src = video.dataset.src;
    video.play().catch(error => {
      if (error.name === "NotAllowedError") {
        wantsMotion = false;
        showControl(false);
      }
    });
  }
  video.addEventListener("playing", () => {
    video.classList.add("has-frame");
    showControl(true);
  });
  video.addEventListener("pause", () => showControl(false));
  video.addEventListener("error", () => {
    failed = true;
    video.classList.remove("has-frame");
    button.hidden = true;
  });
  button.addEventListener("click", () => {
    wantsMotion = video.paused;
    pausedByUser = !wantsMotion;
    try { sessionStorage.setItem("branchlog-pause-banner", pausedByUser ? "yes" : "no"); } catch { /* Optional preference. */ }
    syncPlayback();
  });
  reduced.addEventListener("change", () => {
    wantsMotion = !reduced.matches && !pausedByUser;
    if (reduced.matches) video.classList.remove("has-frame");
    syncPlayback();
  });
  document.addEventListener("visibilitychange", syncPlayback);
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncPlayback();
  }).observe(video);
  video.muted = true;
  showControl(false);
  button.hidden = false;
}
