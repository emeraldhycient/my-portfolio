import http from "node:http";
import { watch, createReadStream, existsSync, statSync, readFileSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("./dist/", import.meta.url)).replace(/\/$/, "");
const port = Number(process.env.PORT || 4173);
const clients = new Set();
const mime = {".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".svg":"image/svg+xml",".woff2":"font/woff2",".txt":"text/plain; charset=utf-8"};
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
  const file = resolve(root, "." + (path === "/" ? "/index.html" : path));
  if (!file.startsWith(root + sep) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404).end("Not found"); return;
  }
  res.writeHead(200, {"Content-Type":mime[extname(file)] || "application/octet-stream","Cache-Control":"no-store"});
  if (req.method === "HEAD") { res.end(); return; }
  if (extname(file) === ".html") { res.end(readFileSync(file, "utf8").replace("</body>", live + "</body>")); return; }
  createReadStream(file).pipe(res);
});
server.on("error", (error) => { console.error(error.message); observer.close(); process.exitCode = 1; });
server.listen(port, "127.0.0.1", () => console.log("Branchlog with live reload: http://127.0.0.1:" + server.address().port + "/"));
