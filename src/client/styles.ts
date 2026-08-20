export const OPENSPEC_STYLES = `
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
.dsh-openspec-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-2);
}
.dsh-openspec-path {
  margin-left: auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--dsw-alias-label-caption);
  font-size: 12px;
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
`

let inserted = false

export function ensureOpenspecStyles(): void {
  if (inserted || typeof document === 'undefined') return
  if (document.getElementById('dsh-openspec-styles')) {
    inserted = true
    return
  }
  const style = document.createElement('style')
  style.id = 'dsh-openspec-styles'
  style.textContent = OPENSPEC_STYLES
  document.head.appendChild(style)
  inserted = true
}
