#!/usr/bin/env node
/**
 * Serves `out/` on 127.0.0.1 with an OS-assigned free port (avoids EADDRINUSE).
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exec } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..", "out");
const openBrowser = process.argv.includes("--open");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".glb": "model/gltf-binary",
  ".txt": "text/plain",
  ".map": "application/json",
};

function resolveUnderRoot(urlPath) {
  let pathname = urlPath.split("?")[0] || "/";
  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (pathname.endsWith("/")) {
    pathname = `${pathname}index.html`;
  }
  const rel = pathname.startsWith("/") ? pathname.slice(1) : pathname;
  const full = path.resolve(path.join(root, rel));
  const rootResolved = path.resolve(root);
  if (full !== rootResolved && !full.startsWith(`${rootResolved}${path.sep}`)) {
    return null;
  }
  return full;
}

function sendFile(res, filePath, method) {
  const ext = path.extname(filePath).toLowerCase();
  res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
  if (method === "HEAD") {
    res.end();
    return;
  }
  const stream = fs.createReadStream(filePath);
  stream.on("error", () => {
    if (!res.headersSent) {
      res.statusCode = 500;
    }
    res.end();
  });
  stream.pipe(res);
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.end();
    return;
  }

  let filePath = resolveUnderRoot(req.url || "/");
  if (!filePath) {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) {
      const fallback404 = path.join(root, "404.html");
      fs.stat(fallback404, (e2, st2) => {
        if (!e2 && st2.isFile()) {
          res.statusCode = 404;
          sendFile(res, fallback404, req.method);
          return;
        }
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end("Not found");
      });
      return;
    }

    res.statusCode = 200;
    sendFile(res, filePath, req.method);
  });
});

server.listen(0, "127.0.0.1", () => {
  const addr = server.address();
  const port = typeof addr === "object" && addr ? addr.port : 0;
  const url = `http://127.0.0.1:${port}`;
  console.log(`\n  Serving: ${root}`);
  console.log(`  Open in browser: ${url}\n  Press Ctrl+C to stop.\n`);

  if (openBrowser && process.platform === "darwin") {
    exec(`open "${url}"`, () => {});
  }
});
