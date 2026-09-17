"use strict";

const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");

const ROOT_DIR = __dirname;
const OGFN_DIR = path.join(ROOT_DIR, "OGFN");
const MAIN_DIR = path.join(ROOT_DIR, "main");
const SITE_ASSETS_DIR = path.join(ROOT_DIR, "Assets");
const CONFIG_PATHS = [
  path.join(ROOT_DIR, "Config", "Config.json"),
  path.join(ROOT_DIR, "config.json"),
];
const TUTORIALS_PAGE_PATH = path.join(OGFN_DIR, "Html", "Tutorials.html");
const TUTORIALS_JSON_PATH = path.join(OGFN_DIR, "data", "tutorials.json");
const TUTORIALS_DATA_JS_PATH = path.join(OGFN_DIR, "js", "tutorials-data.js");
const BUILDS_JSON_PATH = path.join(OGFN_DIR, "data", "Builds.json");
const BUILD_DATA_JS_PATH = path.join(OGFN_DIR, "js", "build-data.js");
const NOT_FOUND_PAGE_PATH = path.join(MAIN_DIR, "html", "404.html");

const DEFAULT_CONFIG = {
  host: "0.0.0.0",
  port: 3000,
  useHttps: false,
  https: {
    keyPath: "",
    certPath: "",
  },
};

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

const EXACT_ROUTES = new Map([
  ["/", path.join(MAIN_DIR, "html", "home.html")],
  ["/Home", path.join(MAIN_DIR, "html", "home.html")],
  ["/Home/", path.join(MAIN_DIR, "html", "home.html")],
  ["/home", path.join(MAIN_DIR, "html", "home.html")],
  ["/home/", path.join(MAIN_DIR, "html", "home.html")],
  ["/favicon.ico", path.join(SITE_ASSETS_DIR, "WEB.ico")],
  ["/ogfn", path.join(OGFN_DIR, "Html", "OGFN.html")],
  ["/ogfn/", path.join(OGFN_DIR, "Html", "OGFN.html")],
  ["/OGFN", path.join(OGFN_DIR, "Html", "OGFN.html")],
  ["/OGFN/", path.join(OGFN_DIR, "Html", "OGFN.html")],
  ["/OGFN/Builds", path.join(OGFN_DIR, "Html", "Builds.html")],
  ["/OGFN/Builds/", path.join(OGFN_DIR, "Html", "Builds.html")],
  ["/OGFN/Builds/windows", path.join(OGFN_DIR, "Html", "WindowChapter.html")],
  ["/OGFN/Builds/windows/", path.join(OGFN_DIR, "Html", "WindowChapter.html")],
  ["/OGFN/Builds/windows/ch1", path.join(OGFN_DIR, "Html", "ch1", "index.html")],
  ["/OGFN/Builds/windows/ch1/", path.join(OGFN_DIR, "Html", "ch1", "index.html")],
  ["/OGFN/Builds/windows/ch2", path.join(OGFN_DIR, "Html", "ch2", "index.html")],
  ["/OGFN/Builds/windows/ch2/", path.join(OGFN_DIR, "Html", "ch2", "index.html")],
  ["/OGFN/Builds/windows/ch3", path.join(OGFN_DIR, "Html", "ch3", "index.html")],
  ["/OGFN/Builds/windows/ch3/", path.join(OGFN_DIR, "Html", "ch3", "index.html")],
  ["/OGFN/Builds/windows/ch4", path.join(OGFN_DIR, "Html", "ch4", "index.html")],
  ["/OGFN/Builds/windows/ch4/", path.join(OGFN_DIR, "Html", "ch4", "index.html")],
  ["/OGFN/Builds/iOS", path.join(OGFN_DIR, "Html", "Builds.html")],
  ["/OGFN/Builds/iOS/", path.join(OGFN_DIR, "Html", "Builds.html")],
  ["/OGFN/Project", path.join(OGFN_DIR, "Html", "Project.html")],
  ["/OGFN/Project/", path.join(OGFN_DIR, "Html", "Project.html")],
  ["/OGFN/Assets", path.join(OGFN_DIR, "Html", "Assets.html")],
  ["/OGFN/Assets/", path.join(OGFN_DIR, "Html", "Assets.html")],
  ["/OGFN/Tutorials", path.join(OGFN_DIR, "Html", "Tutorials.html")],
  ["/OGFN/Tutorials/", path.join(OGFN_DIR, "Html", "Tutorials.html")],
  ["/About", path.join(OGFN_DIR, "Html", "AbtMe.html")],
  ["/About/", path.join(OGFN_DIR, "Html", "AbtMe.html")],
]);

const STATIC_ROUTES = [
  { prefix: "/Assets/", dir: SITE_ASSETS_DIR },
  { prefix: "/main/css/", dir: path.join(MAIN_DIR, "css") },
  { prefix: "/main/data/", dir: path.join(MAIN_DIR, "data") },
  { prefix: "/main/js/", dir: path.join(MAIN_DIR, "js") },
  { prefix: "/assets/", dir: path.join(OGFN_DIR, "assets") },
  { prefix: "/art/", dir: path.join(OGFN_DIR, "art") },
  { prefix: "/css/", dir: path.join(OGFN_DIR, "css") },
  { prefix: "/data/", dir: path.join(OGFN_DIR, "data") },
  { prefix: "/js/", dir: path.join(OGFN_DIR, "js") },
  { prefix: "/OGFN/assets/", dir: path.join(OGFN_DIR, "assets") },
  { prefix: "/OGFN/art/", dir: path.join(OGFN_DIR, "art") },
  { prefix: "/OGFN/css/", dir: path.join(OGFN_DIR, "css") },
  { prefix: "/OGFN/data/", dir: path.join(OGFN_DIR, "data") },
  { prefix: "/OGFN/js/", dir: path.join(OGFN_DIR, "js") },
  { prefix: "/OGFN/Tutorials/assets/", dir: path.join(OGFN_DIR, "assets") },
  { prefix: "/OGFN/Tutorials/art/", dir: path.join(OGFN_DIR, "art") },
  { prefix: "/OGFN/Tutorials/css/", dir: path.join(OGFN_DIR, "css") },
  { prefix: "/OGFN/Tutorials/data/", dir: path.join(OGFN_DIR, "data") },
  { prefix: "/OGFN/Tutorials/js/", dir: path.join(OGFN_DIR, "js") },
  { prefix: "/OGFN/Builds/assets/", dir: path.join(OGFN_DIR, "assets") },
  { prefix: "/OGFN/Builds/art/", dir: path.join(OGFN_DIR, "art") },
  { prefix: "/OGFN/Builds/css/", dir: path.join(OGFN_DIR, "css") },
  { prefix: "/OGFN/Builds/data/", dir: path.join(OGFN_DIR, "data") },
  { prefix: "/OGFN/Builds/js/", dir: path.join(OGFN_DIR, "js") },
];

function loadConfig() {
  const configPath = CONFIG_PATHS.find((candidatePath) => fs.existsSync(candidatePath));
  if (!configPath) {
    return {
      ...DEFAULT_CONFIG,
      https: { ...DEFAULT_CONFIG.https },
    };
  }

  let parsed;

  try {
    parsed = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch (error) {
    throw new Error(`Failed to read config file at ${configPath}: ${error.message}`);
  }

  return {
    ...DEFAULT_CONFIG,
    ...parsed,
    https: {
      ...DEFAULT_CONFIG.https,
      ...(parsed.https || {}),
    },
  };
}

function syncBuildData() {
  const rawJson = fs.readFileSync(BUILDS_JSON_PATH, "utf8");
  const parsedJson = JSON.parse(rawJson);
  const output = `window.OGFN_BUILDS = ${JSON.stringify(parsedJson, null, 2)};\n`;
  fs.writeFileSync(BUILD_DATA_JS_PATH, output, "utf8");
}

function syncTutorialData() {
  const rawJson = fs.readFileSync(TUTORIALS_JSON_PATH, "utf8");
  const parsedJson = JSON.parse(rawJson);
  const output = `window.OGFN_TUTORIALS = ${JSON.stringify(parsedJson, null, 2)};\n`;
  fs.writeFileSync(TUTORIALS_DATA_JS_PATH, output, "utf8");
}

function resolveConfigPath(filePath) {
  if (!filePath) {
    return "";
  }

  return path.isAbsolute(filePath) ? filePath : path.join(ROOT_DIR, filePath);
}

function isSafeChildPath(baseDir, targetPath) {
  const normalizedBase = path.resolve(baseDir);
  const normalizedTarget = path.resolve(targetPath);
  return (
    normalizedTarget === normalizedBase ||
    normalizedTarget.startsWith(`${normalizedBase}${path.sep}`)
  );
}

function resolveStaticFile(pathname) {
  for (const route of STATIC_ROUTES) {
    if (!pathname.startsWith(route.prefix)) {
      continue;
    }

    const relativePath = decodeURIComponent(pathname.slice(route.prefix.length));
    if (!relativePath || relativePath.endsWith("/")) {
      return null;
    }

    const absolutePath = path.resolve(route.dir, relativePath);
    if (!isSafeChildPath(route.dir, absolutePath)) {
      return null;
    }

    return absolutePath;
  }

  return null;
}

function getContentType(filePath) {
  return CONTENT_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

function sendRedirect(response, location) {
  response.writeHead(302, { Location: location });
  response.end();
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload, null, 2));
}

function sendFile(response, filePath, method) {
  sendFileWithStatus(response, filePath, method, 200);
}

function sendFileWithStatus(response, filePath, method, statusCode) {
  if (!fs.existsSync(filePath)) {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  const stat = fs.statSync(filePath);
  if (!stat.isFile()) {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  response.writeHead(statusCode, {
    "Cache-Control": "no-cache",
    "Content-Length": stat.size,
    "Content-Type": getContentType(filePath),
  });

  if (method === "HEAD") {
    response.end();
    return;
  }

  fs.createReadStream(filePath).pipe(response);
}

function sendNotFound(response, method) {
  sendFileWithStatus(response, NOT_FOUND_PAGE_PATH, method, 404);
}

function createRequestHandler() {
  return (request, response) => {
    const method = request.method || "GET";
    if (method !== "GET" && method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end();
      return;
    }

    const url = new URL(request.url || "/", "http://localhost");
    const pathname = url.pathname;

    if (
      pathname === "/OGFN/Tutorials" ||
      pathname === "/OGFN/Tutorials/" ||
      pathname === "/ogfn/tutorials" ||
      pathname === "/ogfn/tutorials/" ||
      pathname.startsWith("/OGFN/Tutorials/") ||
      pathname.startsWith("/ogfn/tutorials/")
    ) {
      sendFile(response, TUTORIALS_PAGE_PATH, method);
      return;
    }

    const exactFile = EXACT_ROUTES.get(pathname);
    if (exactFile) {
      sendFile(response, exactFile, method);
      return;
    }

    const staticFile = resolveStaticFile(pathname);
    if (staticFile) {
      sendFile(response, staticFile, method);
      return;
    }

    sendNotFound(response, method);
  };
}

function createServer(config) {
  const handler = createRequestHandler();

  if (!config.useHttps) {
    return http.createServer(handler);
  }

  const keyPath = resolveConfigPath(config.https.keyPath);
  const certPath = resolveConfigPath(config.https.certPath);
  if (!keyPath || !certPath) {
    throw new Error("HTTPS is enabled but keyPath/certPath are missing in config.json.");
  }

  return https.createServer(
    {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    },
    handler
  );
}

function main() {
  const config = loadConfig();
  syncBuildData();
  syncTutorialData();

  const server = createServer(config);
  server.listen(config.port, config.host, () => {
    const protocol = config.useHttps ? "https" : "http";
    console.log(`Itypto web running at ${protocol}://${config.host}:${config.port}/Home`);
  });
}

main();
