window.__ModuleLoader__.load({ id: "dsh-openspec", factory: (require) => {
var module = { exports: {} }; var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.ts
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(index_exports);

// src/client/OpenspecHeaderAction.ts
var import_react2 = require("react");

// src/client/OpenspecViewer.ts
var import_react = require("react");

// src/client/file-tree.ts
function buildFileTree(files, dirs = []) {
  const root = [];
  const dirNodes = /* @__PURE__ */ new Map();
  function ensureDir(dirPath) {
    if (dirPath === "") return root;
    const existing = dirNodes.get(dirPath);
    if (existing?.children) return existing.children;
    const parts = dirPath.split("/");
    const name2 = parts[parts.length - 1] ?? dirPath;
    const parentPath = parts.slice(0, -1).join("/");
    const siblings = ensureDir(parentPath);
    const node = { name: name2, path: dirPath, kind: "dir", children: [] };
    siblings.push(node);
    dirNodes.set(dirPath, node);
    return node.children ?? [];
  }
  for (const dirPath of dirs) ensureDir(dirPath);
  for (const file of files) {
    const parts = file.split("/");
    const name2 = parts[parts.length - 1] ?? file;
    const parent = parts.slice(0, -1).join("/");
    ensureDir(parent).push({ name: name2, path: file, kind: "file" });
  }
  function sortNodes(nodes) {
    nodes.sort((left, right) => {
      if (left.kind !== right.kind) return left.kind === "dir" ? -1 : 1;
      return left.name.localeCompare(right.name);
    });
    for (const node of nodes) {
      if (node.children) sortNodes(node.children);
    }
    return nodes;
  }
  return sortNodes(root);
}

// src/client/markdown.ts
function escapeHtml(text) {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function sanitizeHtml(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<script\b[^>]*\/?>/gi, "").replace(/<(iframe|object|embed|link|meta|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "").replace(/<(iframe|object|embed|link|meta|style)\b[^>]*\/?>/gi, "").replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "").replace(/(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, '$1="#"');
}
function markdownToHtml(source) {
  const lines = source.replaceAll("\r\n", "\n").split("\n");
  const out = [];
  let inList = false;
  const flushList = () => {
    if (!inList) return;
    out.push("</ul>");
    inList = false;
  };
  for (const line of lines) {
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      flushList();
      const level = heading[1].length;
      out.push(`<h${level}>${escapeHtml(heading[2])}</h${level}>`);
      continue;
    }
    const item = /^[-*]\s+(.+)$/.exec(line);
    if (item) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${escapeHtml(item[1])}</li>`);
      continue;
    }
    if (line.trim() === "") {
      flushList();
      continue;
    }
    flushList();
    out.push(`<p>${line}</p>`);
  }
  flushList();
  return out.join("");
}
function renderMarkdown(source) {
  if (source.trim() === "") return { html: "", empty: true };
  return { html: sanitizeHtml(markdownToHtml(source)), empty: false };
}

// src/client/styles.ts
var OPENSPEC_STYLES = `
.dsh-openspec-root {
  position: relative;
  display: inline-flex;
}
.dsh-openspec-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 111px;
  height: 32px;
  padding: 6px 12px;
  gap: 4px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 18px;
  color: var(--dsw-alias-label-primary);
  background: transparent;
  font-family: var(--dsw-font-family);
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  cursor: pointer;
}
.dsh-openspec-trigger:hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.dsh-openspec-trigger.is-open {
  background: var(--dsw-alias-button-ghost-active-fill);
  border-color: var(--dsw-alias-button-ghost-active-border);
}

.dsh-openspec-popover {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 40;
  display: flex;
  width: min(920px, 86vw);
  height: min(560px, 74vh);
  overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  box-shadow: 0 16px 40px var(--dsw-alias-bg-mask-2);
  font-family: var(--dsw-font-family);
}

.dsh-openspec-shell {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  color: var(--dsw-alias-label-primary);
  font-family: var(--dsw-font-family);
  font-size: 13px;
}

.dsh-openspec-aside {
  display: flex;
  flex-direction: column;
  width: 280px;
  min-width: 220px;
  background: var(--dsw-specific-sidebar-fill);
  border-right: 1px solid var(--dsw-alias-border-l2);
}
.dsh-openspec-aside-title {
  padding: 12px 14px 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--dsw-alias-label-tertiary);
}
.dsh-openspec-banner {
  margin: 0 14px 8px;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--dsw-alias-state-warn-tertiary);
  color: var(--dsw-alias-state-warn-label);
  line-height: 1.45;
}
.dsh-openspec-tree {
  flex: 1;
  overflow: auto;
  padding: 4px 8px 12px;
}
.dsh-openspec-tree ul {
  list-style: none;
  margin: 0;
  padding: 0 0 0 12px;
}
.dsh-openspec-tree > ul {
  padding-left: 0;
}
.dsh-openspec-dir,
.dsh-openspec-file {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 6px;
  margin: 1px 0;
  padding: 5px 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.dsh-openspec-dir {
  color: var(--dsw-alias-label-secondary);
  font-weight: 500;
}
.dsh-openspec-dir:hover,
.dsh-openspec-file:hover {
  background: var(--dsw-specific-sidebar-nav-item-hover);
}
.dsh-openspec-file.is-selected {
  background: var(--dsw-specific-sidebar-nav-item-active);
  color: var(--dsw-alias-label-primary);
}
.dsh-openspec-chevron {
  display: inline-block;
  width: 10px;
  color: var(--dsw-alias-label-caption);
  font-size: 10px;
}
.dsh-openspec-file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dsh-openspec-main {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  background: var(--dsw-alias-bg-layer-1);
}
.dsh-openspec-chrome {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border-bottom: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-2);
}
.dsh-openspec-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px 6px;
}
.dsh-openspec-path {
  display: block;
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  padding: 0 12px 8px;
  color: var(--dsw-alias-label-caption);
  font-size: 12px;
  line-height: 1.45;
  text-align: left;
  overflow-wrap: anywhere;
  word-break: break-all;
}
.dsh-openspec-chip {
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  cursor: pointer;
}
.dsh-openspec-chip:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover);
}
.dsh-openspec-chip.is-active {
  background: var(--dsw-alias-button-ghost-active-fill);
  border-color: var(--dsw-alias-button-ghost-active-border);
  color: var(--dsw-alias-label-primary);
}
.dsh-openspec-chip:disabled {
  opacity: 0.45;
  color: var(--dsw-alias-label-primary);
  cursor: default;
}
.dsh-openspec-save {
  height: 28px;
  padding: 0 12px;
  border: 0;
  border-radius: 8px;
  background: var(--dsw-alias-state-business-primary);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  cursor: pointer;
}
.dsh-openspec-save:hover:not(:disabled) {
  background: var(--dsw-alias-button-info-hover);
}
.dsh-openspec-save:disabled {
  opacity: 0.45;
  color: var(--dsw-alias-label-primary);
  cursor: default;
}
.dsh-openspec-status-ok {
  color: var(--dsw-alias-state-success-primary);
  font-size: 12px;
}
.dsh-openspec-status-err {
  color: var(--dsw-alias-state-error-primary);
  font-size: 12px;
}

.dsh-openspec-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 20px 24px 28px;
  color: var(--dsw-alias-label-primary);
}
.dsh-openspec-empty {
  margin: 24px 0 0;
  color: var(--dsw-alias-label-tertiary);
}
.dsh-openspec-preview h1,
.dsh-openspec-preview h2,
.dsh-openspec-preview h3,
.dsh-openspec-preview h4 {
  margin: 0 0 12px;
  color: var(--dsw-alias-label-primary);
  font-weight: 600;
}
.dsh-openspec-preview p,
.dsh-openspec-preview li {
  margin: 0 0 8px;
  line-height: 1.65;
  color: var(--dsw-alias-label-secondary);
}
.dsh-openspec-preview ul {
  margin: 0 0 12px;
  padding-left: 20px;
}
.dsh-openspec-preview code,
.dsh-openspec-source {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  background: var(--dsw-alias-markdown-code-block);
  color: var(--dsw-alias-label-primary);
}
.dsh-openspec-source {
  margin: 0;
  padding: 14px 16px;
  border-radius: 10px;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.55;
  font-size: 12.5px;
}
.dsh-openspec-editor {
  width: 100%;
  height: 100%;
  min-height: 280px;
  box-sizing: border-box;
  padding: 14px 16px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
  background: var(--dsw-alias-markdown-code-block);
  color: var(--dsw-alias-label-primary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px;
  line-height: 1.55;
  resize: none;
  outline: none;
}
.dsh-openspec-editor:focus {
  border-color: var(--dsw-alias-state-business-primary);
}
`;
var inserted = false;
function ensureOpenspecStyles() {
  if (inserted || typeof document === "undefined") return;
  if (document.getElementById("dsh-openspec-styles")) {
    inserted = true;
    return;
  }
  const style = document.createElement("style");
  style.id = "dsh-openspec-styles";
  style.textContent = OPENSPEC_STYLES;
  document.head.appendChild(style);
  inserted = true;
}

// src/client/viewer-state.ts
var NO_OPENSPEC_BANNER = "\u5F53\u524D\u9879\u76EE\u6CA1\u6709 OpenSpec";
var initialViewerState = {
  loadStatus: "idle",
  present: false,
  files: [],
  dirs: [],
  selected: null,
  mode: "preview",
  content: "",
  draft: "",
  saving: false,
  saveStatus: "idle"
};
function reduceViewer(state, action) {
  switch (action.type) {
    case "load-start":
      return { ...state, loadStatus: "loading", loadError: void 0 };
    case "load-success":
      return {
        ...state,
        loadStatus: "ready",
        loadError: void 0,
        present: action.present !== false,
        files: action.files,
        dirs: action.dirs ?? []
      };
    case "load-error":
      return {
        ...state,
        loadStatus: action.disconnected === true ? "disconnected" : "error",
        loadError: action.error,
        present: false,
        files: [],
        dirs: [],
        saveStatus: "idle",
        saving: false
      };
    case "select":
      return {
        ...state,
        selected: action.path,
        mode: "preview",
        content: "",
        draft: "",
        saveStatus: "idle",
        saveError: void 0
      };
    case "file-loaded":
      return {
        ...state,
        content: action.content,
        draft: action.content,
        saveStatus: "idle",
        saveError: void 0
      };
    case "file-error":
      return { ...state, loadError: action.error, content: "", draft: "" };
    case "set-mode":
      return { ...state, mode: action.mode };
    case "edit":
      return { ...state, draft: action.draft, saveStatus: "idle", saveError: void 0 };
    case "save-start":
      return { ...state, saving: true, saveStatus: "saving", saveError: void 0 };
    case "save-success":
      return {
        ...state,
        saving: false,
        saveStatus: "saved",
        content: state.draft,
        saveError: void 0
      };
    case "save-error":
      return {
        ...state,
        saving: false,
        saveStatus: "error",
        saveError: action.error
      };
    default:
      return state;
  }
}
function selectView(state) {
  const showTree = state.loadStatus === "ready" && state.present;
  const banner = state.loadStatus === "error" || state.loadStatus === "disconnected" ? state.loadError : state.loadStatus === "ready" && !state.present ? NO_OPENSPEC_BANNER : void 0;
  const saved = state.saveStatus === "saved" && !state.saving && state.draft === state.content;
  return { showTree, banner, saved };
}
function isMarkdownPath(filePath) {
  return filePath.toLowerCase().endsWith(".md");
}

// src/client/OpenspecViewer.ts
async function readError(response) {
  try {
    const payload = await response.json();
    if (payload.error) return payload.error;
  } catch {
  }
  return response.statusText || `HTTP ${response.status}`;
}
function withRoot(url, projectRoot) {
  if (!projectRoot) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${new URLSearchParams({ root: projectRoot }).toString()}`;
}
function escapeText(text) {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function TreeNodes(props) {
  return (0, import_react.createElement)(
    "ul",
    null,
    ...props.nodes.map((node) => {
      if (node.kind === "dir") {
        const open = props.expanded.has(node.path);
        return (0, import_react.createElement)(
          "li",
          { key: node.path },
          (0, import_react.createElement)(
            "button",
            {
              type: "button",
              className: "dsh-openspec-dir",
              onClick: () => props.onToggle(node.path)
            },
            (0, import_react.createElement)("span", { className: "dsh-openspec-chevron" }, open ? "\u25BE" : "\u25B8"),
            (0, import_react.createElement)("span", { className: "dsh-openspec-file-name" }, node.name)
          ),
          open && node.children ? (0, import_react.createElement)(TreeNodes, {
            nodes: node.children,
            selected: props.selected,
            expanded: props.expanded,
            onToggle: props.onToggle,
            onSelect: props.onSelect
          }) : null
        );
      }
      return (0, import_react.createElement)(
        "li",
        { key: node.path },
        (0, import_react.createElement)(
          "button",
          {
            type: "button",
            className: `dsh-openspec-file${props.selected === node.path ? " is-selected" : ""}`,
            onClick: () => props.onSelect(node.path)
          },
          (0, import_react.createElement)("span", { className: "dsh-openspec-file-name" }, node.name)
        )
      );
    })
  );
}
function OpenspecViewer({ projectRoot, projectReady = true }) {
  const [state, dispatch] = (0, import_react.useReducer)(reduceViewer, initialViewerState);
  const [expanded, setExpanded] = (0, import_react.useState)(() => /* @__PURE__ */ new Set());
  const view = selectView(state);
  const tree = buildFileTree(state.files, state.dirs);
  const markdown = state.selected !== null && isMarkdownPath(state.selected);
  const preview = markdown ? renderMarkdown(state.content) : null;
  const dirty = state.draft !== state.content;
  (0, import_react.useEffect)(() => {
    ensureOpenspecStyles();
  }, []);
  (0, import_react.useEffect)(() => {
    if (!projectReady) {
      dispatch({ type: "load-start" });
      return;
    }
    let cancelled = false;
    dispatch({ type: "load-start" });
    fetch(withRoot("/openspec-viewer/tree", projectRoot)).then(async (response) => {
      if (!response.ok) throw new Error(await readError(response));
      return await response.json();
    }).then((payload) => {
      if (!cancelled) {
        dispatch({
          type: "load-success",
          files: payload.files,
          dirs: payload.dirs,
          present: payload.present
        });
      }
    }).catch((error) => {
      if (cancelled) return;
      const message = error instanceof Error ? error.message : "failed to load files";
      dispatch({ type: "load-error", error: message, disconnected: error instanceof TypeError });
    });
    return () => {
      cancelled = true;
    };
  }, [projectReady, projectRoot]);
  (0, import_react.useEffect)(() => {
    if (!state.selected || !projectReady) return;
    let cancelled = false;
    const params = new URLSearchParams({ path: state.selected });
    if (projectRoot) params.set("root", projectRoot);
    fetch(`/openspec-viewer/file?${params.toString()}`).then(async (response) => {
      if (!response.ok) throw new Error(await readError(response));
      return await response.json();
    }).then((payload) => {
      if (!cancelled) dispatch({ type: "file-loaded", content: payload.content });
    }).catch((error) => {
      if (!cancelled) {
        dispatch({
          type: "file-error",
          error: error instanceof Error ? error.message : "failed to load file"
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [projectReady, projectRoot, state.selected]);
  async function save() {
    if (!state.selected || state.saving) return;
    dispatch({ type: "save-start" });
    try {
      const response = await fetch("/openspec-viewer/file", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          root: projectRoot,
          path: state.selected,
          content: state.draft
        })
      });
      if (!response.ok) throw new Error(await readError(response));
      dispatch({ type: "save-success" });
    } catch (error) {
      dispatch({
        type: "save-error",
        error: error instanceof Error ? error.message : "save failed"
      });
    }
  }
  function toggleDir(dirPath) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(dirPath)) next.delete(dirPath);
      else next.add(dirPath);
      return next;
    });
  }
  return (0, import_react.createElement)(
    "div",
    { className: "dsh-openspec-shell" },
    (0, import_react.createElement)(
      "aside",
      { className: "dsh-openspec-aside" },
      (0, import_react.createElement)("div", { className: "dsh-openspec-aside-title" }, "openspec"),
      view.banner ? (0, import_react.createElement)("p", { role: "alert", className: "dsh-openspec-banner" }, view.banner) : null,
      view.showTree ? (0, import_react.createElement)(
        "nav",
        { className: "dsh-openspec-tree" },
        (0, import_react.createElement)(TreeNodes, {
          nodes: tree,
          selected: state.selected,
          expanded,
          onToggle: toggleDir,
          onSelect: (path) => dispatch({ type: "select", path })
        })
      ) : null
    ),
    (0, import_react.createElement)(
      "section",
      { className: "dsh-openspec-main" },
      (0, import_react.createElement)(
        "header",
        { className: "dsh-openspec-chrome" },
        (0, import_react.createElement)(
          "div",
          { className: "dsh-openspec-toolbar" },
          (0, import_react.createElement)("button", {
            type: "button",
            className: `dsh-openspec-chip${state.mode === "preview" ? " is-active" : ""}`,
            onClick: () => dispatch({ type: "set-mode", mode: "preview" })
          }, "\u9884\u89C8"),
          (0, import_react.createElement)("button", {
            type: "button",
            className: `dsh-openspec-chip${state.mode === "edit" ? " is-active" : ""}`,
            onClick: () => dispatch({ type: "set-mode", mode: "edit" }),
            disabled: !state.selected
          }, "\u7F16\u8F91"),
          (0, import_react.createElement)("button", {
            type: "button",
            className: "dsh-openspec-save",
            onClick: () => {
              void save();
            },
            disabled: !state.selected || !dirty || state.saving
          }, state.saving ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58"),
          view.saved ? (0, import_react.createElement)("span", { className: "dsh-openspec-status-ok" }, "\u5DF2\u4FDD\u5B58") : null,
          state.saveError ? (0, import_react.createElement)("span", { role: "alert", className: "dsh-openspec-status-err" }, state.saveError) : null
        ),
        state.selected ? (0, import_react.createElement)("div", { className: "dsh-openspec-path" }, state.selected) : null
      ),
      (0, import_react.createElement)(
        "div",
        { className: "dsh-openspec-body" },
        !state.selected && view.showTree ? (0, import_react.createElement)("p", { className: "dsh-openspec-empty" }, "\u9009\u62E9\u4E00\u4E2A\u6587\u4EF6\u3002") : null,
        state.selected && state.mode === "preview" && markdown && preview?.empty ? (0, import_react.createElement)("p", { className: "dsh-openspec-empty" }, "\u7A7A\u6587\u4EF6") : null,
        state.selected && state.mode === "preview" && markdown && preview && !preview.empty ? (0, import_react.createElement)("div", {
          className: "dsh-openspec-preview",
          dangerouslySetInnerHTML: { __html: preview.html }
        }) : null,
        state.selected && state.mode === "preview" && !markdown ? (0, import_react.createElement)("pre", {
          className: "dsh-openspec-source",
          dangerouslySetInnerHTML: { __html: escapeText(state.content) }
        }) : null,
        state.selected && state.mode === "edit" ? (0, import_react.createElement)("textarea", {
          className: "dsh-openspec-editor",
          value: state.draft,
          onChange: (event) => dispatch({ type: "edit", draft: event.target.value })
        }) : null
      )
    )
  );
}

// src/client/project-root.ts
function projectRootFromSlot(input) {
  const sessionId = input.sessionId == null ? "" : String(input.sessionId);
  const fromWorkspace = input.workspaces?.find(
    (workspace) => Array.isArray(workspace.sessionIds) && workspace.sessionIds.some((id) => String(id) === sessionId)
  )?.path;
  if (typeof fromWorkspace === "string" && fromWorkspace.trim() !== "") return fromWorkspace.trim();
  if (typeof input.sessionCwd === "string" && input.sessionCwd.trim() !== "") return input.sessionCwd.trim();
  return void 0;
}
function fallbackWorkspaces(selector) {
  return selector({ items: [], baselinesReady: true });
}
function fallbackSessions(selector) {
  return selector({ byId: {} });
}

// src/client/OpenspecHeaderAction.ts
function OpenspecHeaderAction(props = {}) {
  const [open, setOpen] = (0, import_react2.useState)(false);
  const rootRef = (0, import_react2.useRef)(null);
  const useWorkspaces = props.useWorkspaces ?? fallbackWorkspaces;
  const useSessions = props.useSessions ?? fallbackSessions;
  const workspaceState = useWorkspaces((state) => ({
    items: state.items ?? [],
    ready: state.baselinesReady !== false
  }));
  const sessionCwd = useSessions((state) => state.byId?.[String(props.sessionId ?? "")]?.cwd);
  const projectRoot = projectRootFromSlot({
    sessionId: props.sessionId,
    workspaces: workspaceState.items,
    sessionCwd
  });
  const projectReady = workspaceState.ready;
  (0, import_react2.useEffect)(() => {
    ensureOpenspecStyles();
  }, []);
  (0, import_react2.useEffect)(() => {
    if (!open) return;
    const onPointer = (event) => {
      const target = event.target;
      if (target instanceof Node && rootRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (0, import_react2.createElement)(
    "div",
    { ref: rootRef, className: "dsh-openspec-root" },
    (0, import_react2.createElement)(
      "button",
      {
        type: "button",
        className: `dsh-openspec-trigger${open ? " is-open" : ""}`,
        "aria-expanded": open,
        "aria-haspopup": "dialog",
        onClick: () => {
          setOpen((current) => !current);
        }
      },
      "OpenSpec"
    ),
    open ? (0, import_react2.createElement)(
      "div",
      { role: "dialog", "aria-label": "OpenSpec", className: "dsh-openspec-popover" },
      (0, import_react2.createElement)(OpenspecViewer, { projectRoot, projectReady })
    ) : null
  );
}

// src/client/index.ts
var inject = ["slots"];
var name = "openspec-web-viewer-client";
function apply(ctx) {
  ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({
    name: "conversation.session.header.utilities",
    id: "openspec-web-viewer",
    order: 10,
    label: "OpenSpec"
  }, OpenspecHeaderAction));
}
return module.exports; } });
