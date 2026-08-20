import assert from 'node:assert/strict'
import { test } from 'node:test'
import { initialViewerState, reduceViewer, selectView } from '../src/client/viewer-state.ts'

test('project without OpenSpec shows a banner and no file tree', () => {
  const state = reduceViewer(initialViewerState, {
    type: 'load-success',
    files: [],
    present: false,
  })
  const view = selectView(state)
  assert.equal(view.showTree, false)
  assert.equal(view.banner, '当前项目没有 OpenSpec')
  assert.equal(state.files.length, 0)
  assert.equal(state.loadStatus, 'ready')
})

test('invalid root load error shows message and no file tree', () => {
  const state = reduceViewer(initialViewerState, {
    type: 'load-error',
    error: 'openspec not found',
    disconnected: false,
  })
  const view = selectView(state)
  assert.equal(view.showTree, false)
  assert.match(view.banner ?? '', /openspec not found/)
  assert.equal(state.files.length, 0)
  assert.equal(state.loadStatus, 'error')
})

test('disconnected load does not treat cache as saved content', () => {
  const loaded = reduceViewer(initialViewerState, {
    type: 'load-success',
    files: ['changes/demo/proposal.md'],
  })
  const opened = reduceViewer(
    reduceViewer(loaded, { type: 'select', path: 'changes/demo/proposal.md' }),
    { type: 'file-loaded', content: '# Hello' },
  )
  const disconnected = reduceViewer(opened, {
    type: 'load-error',
    error: 'network error',
    disconnected: true,
  })
  const view = selectView(disconnected)
  assert.equal(disconnected.loadStatus, 'disconnected')
  assert.equal(view.showTree, false)
  assert.equal(disconnected.saveStatus, 'idle')
  assert.match(view.banner ?? '', /network error|连接/i)
})

test('save stays in-flight until host confirms', () => {
  let state = reduceViewer(initialViewerState, {
    type: 'load-success',
    files: ['changes/demo/proposal.md'],
  })
  state = reduceViewer(state, { type: 'select', path: 'changes/demo/proposal.md' })
  state = reduceViewer(state, { type: 'file-loaded', content: '# Hello' })
  state = reduceViewer(state, { type: 'set-mode', mode: 'edit' })
  state = reduceViewer(state, { type: 'edit', draft: '# Draft' })
  state = reduceViewer(state, { type: 'save-start' })
  assert.equal(state.saving, true)
  assert.equal(state.saveStatus, 'saving')
  assert.equal(selectView(state).saved, false)
  const saved = reduceViewer(state, { type: 'save-success' })
  assert.equal(saved.saving, false)
  assert.equal(saved.saveStatus, 'saved')
  assert.equal(saved.content, '# Draft')
  assert.equal(saved.draft, '# Draft')
  assert.equal(selectView(saved).saved, true)
})

test('save failure keeps the draft and surfaces the error', () => {
  let state = reduceViewer(initialViewerState, {
    type: 'load-success',
    files: ['changes/demo/proposal.md'],
  })
  state = reduceViewer(state, { type: 'select', path: 'changes/demo/proposal.md' })
  state = reduceViewer(state, { type: 'file-loaded', content: '# Hello' })
  state = reduceViewer(state, { type: 'set-mode', mode: 'edit' })
  state = reduceViewer(state, { type: 'edit', draft: '# Keep me' })
  state = reduceViewer(state, { type: 'save-start' })
  const failed = reduceViewer(state, { type: 'save-error', error: 'permission denied' })
  assert.equal(failed.draft, '# Keep me')
  assert.equal(failed.content, '# Hello')
  assert.equal(failed.saving, false)
  assert.equal(failed.saveStatus, 'error')
  assert.match(failed.saveError ?? '', /permission denied/)
  assert.equal(selectView(failed).saved, false)
})

test('preview after save uses the saved content', () => {
  let state = reduceViewer(initialViewerState, {
    type: 'load-success',
    files: ['config.yaml'],
  })
  state = reduceViewer(state, { type: 'select', path: 'config.yaml' })
  state = reduceViewer(state, { type: 'file-loaded', content: 'schema: spec-driven' })
  state = reduceViewer(state, { type: 'set-mode', mode: 'edit' })
  state = reduceViewer(state, { type: 'edit', draft: 'schema: custom' })
  state = reduceViewer(state, { type: 'save-success' })
  state = reduceViewer(state, { type: 'set-mode', mode: 'preview' })
  assert.equal(state.mode, 'preview')
  assert.equal(state.content, 'schema: custom')
})
