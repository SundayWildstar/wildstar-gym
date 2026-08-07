// Self-hosted Wildstar server: static site + /api/store sync endpoint.
// Zero dependencies. Data persists to DATA_DIR/store.json.
//   FAMILY_KEY  – passcode devices must present (required for sync)
//   PORT        – default 8080
//   DATA_DIR    – default /data

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 8080);
const DATA_DIR = process.env.DATA_DIR || "/data";
const STORE_FILE = path.join(DATA_DIR, "store.json");
const ROOT = path.join(__dirname, "..");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".json": "application/json",
  ".ico": "image/x-icon",
};

function sendJSON(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(obj));
}

function handleApi(req, res) {
  const familyKey = process.env.FAMILY_KEY;
  if (!familyKey) return sendJSON(res, 503, { error: "Sync not configured: set the FAMILY_KEY environment variable." });
  if (req.headers["x-family-key"] !== familyKey) return sendJSON(res, 401, { error: "Wrong family passcode." });

  if (req.method === "GET") {
    try {
      const raw = fs.readFileSync(STORE_FILE, "utf8");
      res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
      return res.end(raw);
    } catch (e) {
      return sendJSON(res, 200, null);
    }
  }

  if (req.method === "POST") {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 2_000_000) { sendJSON(res, 413, { error: "Store too large." }); req.destroy(); }
    });
    req.on("end", () => {
      try {
        JSON.parse(body); // validate before writing
        fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(STORE_FILE + ".tmp", body);
        fs.renameSync(STORE_FILE + ".tmp", STORE_FILE);
        sendJSON(res, 200, { ok: true });
      } catch (e) {
        sendJSON(res, 400, { error: "Body must be valid JSON." });
      }
    });
    return;
  }

  sendJSON(res, 405, { error: "Use GET or POST." });
}

http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  if (url.pathname === "/api/store") return handleApi(req, res);

  // Static files, with directory traversal guard.
  let rel = decodeURIComponent(url.pathname);
  if (rel === "/" || rel === "") rel = "/index.html";
  const file = path.normalize(path.join(ROOT, rel));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }

  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { "Content-Type": "text/plain" }); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream" });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Wildstar Home Gym running on port ${PORT}`));
