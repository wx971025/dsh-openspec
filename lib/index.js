// src/openspec-fs.ts
import fs from "node:fs";
import path from "node:path";
var NO_OPENSPEC_MESSAGE = "\u5F53\u524D\u9879\u76EE\u6CA1\u6709 OpenSpec";
var OpenspecError = class extends Error {
  code;
  constructor(code, message) {
    super(message);
    this.name = "OpenspecError";
    this.code = code;
  }
};
function isInside(parent, child) {
  const rel = path.relative(parent, child);
  return rel === "" || !rel.startsWith(`..${path.sep}`) && rel !== ".." && !path.isAbsolute(rel);
}
function resolveProjectRoot(projectRoot) {
  if (typeof projectRoot !== "string" || projectRoot.trim() === "") return void 0;
  const trimmed = projectRoot.trim();
  if (!path.isAbsolute(trimmed)) {
    throw new OpenspecError("invalid-path", "project root must be an absolute path");
  }
  return path.resolve(trimmed);
}
function resolveOpenspecDir(projectRoot) {
  const root = resolveProjectRoot(projectRoot);
  if (root === void 0) {
    throw new OpenspecError("not-openspec", NO_OPENSPEC_MESSAGE);
  }
  const openspec = path.join(root, "openspec");
  if (!fs.existsSync(openspec) || !fs.statSync(openspec).isDirectory()) {
    throw new OpenspecError("not-openspec", NO_OPENSPEC_MESSAGE);
  }
  return fs.realpathSync(openspec);
}
function assertRelPath(relPath) {
  if (!relPath || path.isAbsolute(relPath) || relPath.split(/[/\\]/).includes("..") || relPath.split(/[/\\]/).includes(".") || relPath.split(/[/\\]/).includes("")) {
    throw new OpenspecError("invalid-path", "path escapes openspec directory");
  }
}
function resolveExistingFile(projectRoot, relPath) {
  const openspecDir = resolveOpenspecDir(projectRoot);
  assertRelPath(relPath);
  const target = path.resolve(openspecDir, relPath);
  if (!fs.existsSync(target)) {
    throw new OpenspecError("not-found", "file does not exist");
  }
  const real = fs.realpathSync(target);
  if (!isInside(openspecDir, real)) {
    throw new OpenspecError("forbidden", "path escapes openspec directory");
  }
  const stat = fs.statSync(real);
  if (!stat.isFile()) {
    throw new OpenspecError("not-file", "only files are allowed");
  }
  return real;
}
function walkEntries(dir, prefix, files, dirs) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const rel = prefix === "" ? entry.name : `${prefix}/${entry.name}`;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      dirs.push(rel);
      walkEntries(full, rel, files, dirs);
      continue;
    }
    if (entry.isFile()) files.push(rel);
  }
}
function listOpenspecFiles(projectRoot) {
  try {
    const openspecDir = resolveOpenspecDir(projectRoot);
    const files = [];
    const dirs = [];
    walkEntries(openspecDir, "", files, dirs);
    return {
      present: true,
      files: files.sort((a, b) => a.localeCompare(b)),
      dirs: dirs.sort((a, b) => a.localeCompare(b))
    };
  } catch (error) {
    if (error instanceof OpenspecError && error.code === "not-openspec") {
      return { present: false, files: [], dirs: [] };
    }
    throw error;
  }
}
function readFile(projectRoot, relPath) {
  const file = resolveExistingFile(projectRoot, relPath);
  return fs.readFileSync(file, "utf8");
}
function writeFile(projectRoot, relPath, content) {
  const file = resolveExistingFile(projectRoot, relPath);
  fs.writeFileSync(file, content, "utf8");
}

// src/http.ts
function statusFor(error) {
  if (error.code === "not-openspec") return 404;
  if (error.code === "invalid-root") return 400;
  if (error.code === "forbidden" || error.code === "invalid-path") return 403;
  if (error.code === "not-found" || error.code === "not-file") return 404;
  return 400;
}
function fail(error) {
  if (error instanceof OpenspecError) {
    return { status: statusFor(error), body: { error: error.message, code: error.code } };
  }
  const message = error instanceof Error ? error.message : "unexpected error";
  return { status: 500, body: { error: message } };
}
function routeTail(pathname) {
  const prefix = "/openspec-viewer";
  if (pathname === prefix) return "";
  if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  return pathname;
}
function parseJsonBody(raw) {
  if (!raw) return void 0;
  try {
    const parsed = JSON.parse(raw);
    if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    return void 0;
  }
  return void 0;
}
function requestRoot(input, payload) {
  const fromQuery = input.searchParams.get("root");
  if (fromQuery) return fromQuery;
  const fromBody = payload?.root;
  return typeof fromBody === "string" ? fromBody : void 0;
}
async function handleOpenspecHttp(input) {
  const method = input.method.toUpperCase();
  const tail = routeTail(input.pathname);
  try {
    if (method === "GET" && (tail === "/tree" || tail === "/changes")) {
      const listed = listOpenspecFiles(requestRoot(input));
      if (!listed.present) {
        return { status: 200, body: { present: false, files: [], dirs: [], message: NO_OPENSPEC_MESSAGE } };
      }
      return { status: 200, body: { present: true, files: listed.files, dirs: listed.dirs } };
    }
    if (method === "GET" && tail === "/file") {
      const relPath = input.searchParams.get("path") ?? "";
      const content = readFile(requestRoot(input), relPath);
      return { status: 200, body: { content } };
    }
    if (method === "PUT" && tail === "/file") {
      const payload = parseJsonBody(input.body);
      if (payload === void 0) {
        return { status: 400, body: { error: "invalid JSON body" } };
      }
      if (typeof payload.content !== "string") {
        return { status: 400, body: { error: "content must be a string" } };
      }
      const relPath = typeof payload.path === "string" ? payload.path : "";
      writeFile(requestRoot(input, payload), relPath, payload.content);
      return { status: 200, body: { ok: true } };
    }
    return { status: 404, body: { error: "not found" } };
  } catch (error) {
    return fail(error);
  }
}

// src/index.ts
var name = "openspec-web-viewer";
var inject = ["webServer"];
function apply(ctx) {
  ctx.effect(() => {
    const dispose = ctx.webServer.register({
      kind: "prefix",
      path: "/openspec-viewer",
      handler: (req, res) => handleOpenspecRequest(req, res)
    });
    return dispose;
  });
}
async function handleOpenspecRequest(req, res) {
  const host = req.headers.host ?? "127.0.0.1";
  const url = new URL(req.url ?? "/", `http://${host}`);
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const rawBody = Buffer.concat(chunks).toString("utf8");
  const result = await handleOpenspecHttp({
    method: req.method ?? "GET",
    pathname: url.pathname,
    searchParams: url.searchParams,
    body: rawBody
  });
  res.writeHead(result.status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(result.body));
}
export {
  apply,
  inject,
  name
};
