import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, test } from 'node:test'
import { apply } from '../src/index.ts'
import { handleOpenspecHttp } from '../src/http.ts'
import { NO_OPENSPEC_MESSAGE } from '../src/openspec-fs.ts'

const fixtures: string[] = []

afterEach(() => {
  for (const dir of fixtures.splice(0)) fs.rmSync(dir, { recursive: true, force: true })
})

function seed(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dsh-openspec-http-'))
  fixtures.push(root)
  const openspec = path.join(root, 'openspec')
  fs.mkdirSync(path.join(openspec, 'changes', 'demo-change'), { recursive: true })
  fs.mkdirSync(path.join(openspec, 'specs'), { recursive: true })
  fs.writeFileSync(path.join(openspec, 'config.yaml'), 'schema: spec-driven\n')
  fs.writeFileSync(path.join(openspec, 'changes', 'demo-change', 'proposal.md'), '# Hello\n')
  fs.writeFileSync(path.join(openspec, 'specs', 'note.md'), '# Specs\n')
  return root
}

function rootParams(root: string): URLSearchParams {
  return new URLSearchParams({ root })
}

test('GET /tree returns present=false when the project has no OpenSpec', async () => {
  const result = await handleOpenspecHttp({
    method: 'GET',
    pathname: '/openspec-viewer/tree',
    searchParams: new URLSearchParams(),
  })
  assert.equal(result.status, 200)
  assert.deepEqual(result.body, { present: false, files: [], dirs: [], message: NO_OPENSPEC_MESSAGE })
})

test('GET /tree returns present=false for a directory without openspec/', async () => {
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'dsh-openspec-empty-'))
  fixtures.push(empty)
  const result = await handleOpenspecHttp({
    method: 'GET',
    pathname: '/openspec-viewer/tree',
    searchParams: rootParams(empty),
  })
  assert.equal(result.status, 200)
  assert.deepEqual(result.body, { present: false, files: [], dirs: [], message: NO_OPENSPEC_MESSAGE })
})

test('GET /tree lists every file under openspec/', async () => {
  const root = seed()
  const result = await handleOpenspecHttp({
    method: 'GET',
    pathname: '/openspec-viewer/tree',
    searchParams: rootParams(root),
  })
  assert.equal(result.status, 200)
  assert.deepEqual(result.body, {
    present: true,
    files: [
      'changes/demo-change/proposal.md',
      'config.yaml',
      'specs/note.md',
    ],
    dirs: [
      'changes',
      'changes/demo-change',
      'specs',
    ],
  })
})

test('GET /file returns content by path under openspec/', async () => {
  const root = seed()
  const result = await handleOpenspecHttp({
    method: 'GET',
    pathname: '/openspec-viewer/file',
    searchParams: new URLSearchParams({ root, path: 'config.yaml' }),
  })
  assert.equal(result.status, 200)
  assert.deepEqual(result.body, { content: 'schema: spec-driven\n' })
})

test('GET /file rejects path traversal with 403 or 400', async () => {
  const root = seed()
  const result = await handleOpenspecHttp({
    method: 'GET',
    pathname: '/openspec-viewer/file',
    searchParams: new URLSearchParams({
      root,
      path: '../secret.md',
    }),
  })
  assert.ok(result.status === 400 || result.status === 403)
  assert.equal(typeof (result.body as { error: string }).error, 'string')
})

test('PUT /file overwrites an existing file under openspec/', async () => {
  const root = seed()
  const result = await handleOpenspecHttp({
    method: 'PUT',
    pathname: '/openspec-viewer/file',
    searchParams: new URLSearchParams(),
    body: JSON.stringify({
      root,
      path: 'changes/demo-change/proposal.md',
      content: '# Saved\n',
    }),
  })
  assert.equal(result.status, 200)
  assert.equal(
    fs.readFileSync(path.join(root, 'openspec', 'changes', 'demo-change', 'proposal.md'), 'utf8'),
    '# Saved\n',
  )
})

test('apply registers /openspec-viewer and unregistering removes it', () => {
  const routes = new Map<string, unknown>()
  const captured: Array<() => void> = []
  const ctx2 = {
    webServer: {
      register(route: { path: string }) {
        routes.clear()
        routes.set(route.path, route)
        const dispose = () => { routes.delete(route.path) }
        captured.push(dispose)
        return dispose
      },
    },
    effect(fn: () => (() => void) | void) {
      const dispose = fn()
      if (typeof dispose === 'function') captured.push(dispose)
    },
  }
  apply(ctx2)
  assert.equal(routes.has('/openspec-viewer'), true)
  for (const dispose of captured) dispose()
  assert.equal(routes.has('/openspec-viewer'), false)
})
