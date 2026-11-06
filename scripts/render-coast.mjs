// Render one seamless turn of the lighthouse lantern. Requires ffmpeg on PATH.
// The animation uses the portfolio's own artwork and has no runtime renderer.
import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

const images = fileURLToPath(new URL("../dist/images/", import.meta.url));
const width = 1344;
const height = 448;
const scale = width / 820;
const fps = 24;
const frames = fps * 8;
const tau = 2 * Math.PI;
const clamp = (n, low, high) => Math.min(high, Math.max(low, n));

function ffmpeg(args, limit = 1024 * 1024) {
  const result = spawnSync("ffmpeg", ["-v", "error", "-y", ...args], { maxBuffer: limit });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr.toString());
  return result.stdout;
}
const still = ffmpeg(["-i", images + "coast-banner.webp", "-vf", `scale=${width}:${height}`,
  "-pix_fmt", "rgb24", "-f", "rawvideo", "-frames:v", "1", "pipe:1"], width * height * 4);

// Coordinates are in the small 820-pixel print's space. Feather the shores so
// only the water moves; the rocks, tree, and lighthouse hold their silhouettes.
const sea = [[577,124],[824,122],[824,277],[507,277],[487,259],[453,252],
  [422,252],[408,245],[429,235],[412,231],[439,225],[469,216],[513,214],
  [544,207],[562,210],[568,202],[597,196],[629,185],[649,178],[638,169],
  [631,155],[626,141],[601,140],[593,132]];
const bay = [[205,157],[304,145],[366,140],[398,135],[383,145],[333,153],
  [297,161],[256,164],[219,173],[211,172]];
const rocks = [
  [[513,223],[519,215],[530,210],[538,213],[546,223],[552,228],[535,229]],
  [[675,181],[684,166],[694,164],[707,179],[716,181],[695,185]],
];

function polygonWeight(x, y, polygon, feather) {
  let inside = false;
  let nearest = Infinity;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [ax, ay] = polygon[j];
    const [bx, by] = polygon[i];
    if ((ay > y) !== (by > y) && x < ax + (bx - ax) * (y - ay) / (by - ay)) inside = !inside;
    const vx = bx - ax, vy = by - ay;
    const u = clamp(((x-ax)*vx + (y-ay)*vy) / (vx*vx + vy*vy), 0, 1);
    nearest = Math.min(nearest, Math.hypot(x - ax - u*vx, y - ay - u*vy));
  }
  return inside ? clamp(nearest / feather, 0, 1) : 0;
}
const water = [];
for (let y = Math.floor(122*scale); y < height; y++) {
  for (let x = 0; x < width; x++) {
    const px = x/scale, py = y/scale;
    let weight = Math.max(polygonWeight(px, py, sea, 5), .65*polygonWeight(px, py, bay, 3));
    if (!weight) continue;
    for (const rock of rocks) weight *= 1 - polygonWeight(px, py, rock, 1.5);
    if (weight) water.push({ x, y, px, py, weight, depth:clamp((py-122)/145, 0, 1) });
  }
}
function moveWater(frame, phase) {
  for (const {x, y, px, py, weight, depth} of water) {
    const swell = Math.sin(phase*2 + py*.13 + px*.013);
    const ripple = Math.sin(phase - px*.026 + py*.21);
    const sx = clamp(x + scale*weight*((.75+2.5*depth)*swell + (.3+.6*depth)*ripple), 0, width-1);
    const sy = clamp(y + scale*weight*(.4+1.05*depth)*Math.sin(phase*2 + px*.031 + py*.14), 0, height-1);
    const ix = Math.floor(sx), iy = Math.floor(sy);
    const fx = sx-ix, fy = sy-iy;
    const a = 3*(iy*width+ix);
    const b = ix < width-1 ? a+3 : a;
    const c = iy < height-1 ? a+width*3 : a;
    const d = c+(b-a);
    const dst = 3*(y*width+x);
    const shimmer = 1 + weight*(.055*swell + .028*ripple);
    for (let channel=0; channel<3; channel++) {
      const upper = still[a+channel]*(1-fx) + still[b+channel]*fx;
      const lower = still[c+channel]*(1-fx) + still[d+channel]*fx;
      frame[dst+channel] = pixel((upper*(1-fy) + lower*fy)*shimmer);
    }
  }
}
const pixel = n => clamp(Math.round(n), 0, 255);
function light(frame, x, y, alpha) {
  const i = 3*(y*width+x);
  frame[i]   = pixel(frame[i]   + (255-frame[i])*alpha);
  frame[i+1] = pixel(frame[i+1] + (216-frame[i+1])*alpha);
  frame[i+2] = pixel(frame[i+2] + (146-frame[i+2])*alpha);
}
function turnLantern(frame, phase) {
  const lampX = 528.7, lampY = 90.2;
  const angle = phase + .45;
  const projection = Math.cos(angle);
  const reach = 291*Math.abs(projection);
  const slope = -.045 + .11*Math.sin(angle);
  const front = Math.max(0, Math.sin(angle))**8;
  for (let x = 0; x < width; x++) {
    const dx = x/scale - lampX;
    const distance = dx*Math.sign(projection);
    if (distance < 0 || distance >= reach) continue;
    const cy = lampY + distance*slope;
    const spread = 1.1 + distance*.052;
    const fade = Math.abs(projection)*Math.min(1, (reach-distance)/65)*(1 - .61*distance/reach);
    for (let y=Math.max(0,Math.floor(scale*(cy-spread))); y<Math.min(height,scale*(cy+spread)); y++) {
      const edge = (y/scale-cy) / spread;
      light(frame, x, y, .36*fade*(1-edge*edge)**2);
    }
  }
  const halo = 6 + front*8;
  for (let y=Math.floor((lampY-halo)*scale); y<(lampY+halo)*scale; y++) {
    for (let x=Math.floor((lampX-halo)*scale); x<(lampX+halo)*scale; x++) {
      const r = Math.hypot(x/scale-lampX, y/scale-lampY) / halo;
      if (r < 1) light(frame,x,y,(.17+.58*front)*(1-r)**2);
    }
  }
}

const encoder = spawn("ffmpeg", ["-v","error","-y","-f","rawvideo","-pix_fmt","rgb24",
  "-s",width+"x"+height,"-r",String(fps),"-i","pipe:0","-an","-c:v","libx264",
  "-preset","slow","-crf","19","-pix_fmt","yuv420p","-movflags","+faststart",
  images+"coast-loop.mp4"], {stdio:["pipe","ignore","inherit"]});
const finished = once(encoder, "close");
for (let i=0; i<frames; i++) {
  const phase = tau*i/frames;
  const frame = Buffer.from(still);
  moveWater(frame, phase);
  turnLantern(frame, phase);
  if (!encoder.stdin.write(frame)) await once(encoder.stdin,"drain");
}
encoder.stdin.end();
const [code] = await finished;
if (code !== 0) throw new Error("Video encoding failed.");
ffmpeg(["-i", images+"coast-loop.mp4","-filter_complex",
  "fps=12,scale=820:-2:flags=lanczos,split[a][b];[a]palettegen=max_colors=256:stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle",
  "-loop","0",images+"coast-loop.gif"]);
