import http from "node:http";
import { watch, createReadStream, existsSync, statSync, readFileSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("./dist/", import.meta.url)).replace(/\/$/, "");
const port = Number(process.env.PORT || 4173);
const clients = new Set();
const mime = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml", ".webp": "image/webp", ".gif": "image/gif", ".mp4": "video/mp4",
  ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8",
};
const live = '<script>(()=>{const feed=new EventSource("/__live");feed.addEventListener("change",()=>location.reload());})();</script>';
let timer;
const observer = watch(root, {recursive:true}, () => {
  clearTimeout(timer);
  timer = setTimeout(() => { for (const res of clients) res.write("event: change\ndata: update\n\n"); }, 180);
});
const server = http.createServer((req, res) => {
  let path;
  try { path = decodeURIComponent(new URL(req.url, "http://localhost").pathname); }
  catch { res.writeHead(400).end(); return; }
  if (path === "/__live") {
    res.writeHead(200, {"Content-Type":"text/event-stream","Cache-Control":"no-store","Connection":"keep-alive"});
    res.write(": live reload\n\n"); clients.add(res); req.on("close", () => clients.delete(res)); return;
  }
  let file = resolve(root, "." + path);
  if (file !== root && !file.startsWith(root + sep)) { res.writeHead(404).end(); return; }
  if (existsSync(file) && statSync(file).isDirectory()) {
    if (!path.endsWith("/")) {
      const url = new URL(req.url, "http://localhost");
      res.writeHead(308, {"Location": url.pathname + "/" + url.search}).end(); return;
    }
    file = resolve(file, "index.html");
  }
  if (!existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404).end("Not found"); return;
  }
  const extension = extname(file);
  const headers = {"Content-Type": mime[extension] || "application/octet-stream", "Cache-Control": "no-store"};
  if (extension === ".html") {
    res.writeHead(200, headers);
    res.end(req.method === "HEAD" ? undefined : readFileSync(file, "utf8").replace("</body>", live + "</body>"));
    return;
  }
  const size = statSync(file).size;
  let start = 0, end = size - 1;
  const range = req.headers.range;
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (match && (match[1] || match[2])) {
      start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
      if (match[1] && match[2]) end = Math.min(end, Number(match[2]));
    } else start = size;
    if (start > end) {
      res.writeHead(416, {"Content-Range": "bytes */" + size}).end(); return;
    }
    headers["Content-Range"] = `bytes ${start}-${end}/${size}`;
  }
  headers["Accept-Ranges"] = "bytes";
  headers["Content-Length"] = end - start + 1;
  res.writeHead(range ? 206 : 200, headers);
  if (req.method === "HEAD") { res.end(); return; }
  if (!size) { res.end(); return; }
  createReadStream(file, {start, end}).pipe(res);
});
server.on("error", (error) => { console.error(error.message); observer.close(); process.exitCode = 1; });
server.listen(port, "127.0.0.1", () => console.log("Branchlog with live reload: http://127.0.0.1:" + server.address().port + "/"));
