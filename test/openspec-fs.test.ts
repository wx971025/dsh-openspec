import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, test } from 'node:test'
import {
  OpenspecError,
  listOpenspecFiles,
  readFile,
  resolveExistingFile,
  resolveOpenspecDir,
  writeFile,
} from '../src/openspec-fs.ts'

const fixtures: string[] = []

function tmpRoot(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dsh-openspec-'))
  fixtures.push(dir)
  return dir
}

afterEach(() => {
  for (const dir of fixtures.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

function seedProject(options?: { withArchive?: boolean; extraJson?: boolean }): string {
  const root = tmpRoot()
  const openspec = path.join(root, 'openspec')
  const change = path.join(openspec, 'changes', 'add-openspec-web-plugin')
  fs.mkdirSync(path.join(change, 'specs', 'openspec-web-viewer'), { recursive: true })
  fs.mkdirSync(path.join(openspec, 'specs', 'openspec-web-viewer'), { recursive: true })
  fs.writeFileSync(path.join(openspec, 'config.yaml'), 'schema: spec-driven\n')
  fs.writeFileSync(path.join(openspec, 'specs', 'openspec-web-viewer', 'spec.md'), '# Main spec\n')
  fs.writeFileSync(path.join(change, 'proposal.md'), '# Why\n')
  fs.writeFileSync(path.join(change, 'design.md'), '# Design\n')
  fs.writeFileSync(path.join(change, 'tasks.md'), '# Tasks\n')
  fs.writeFileSync(path.join(change, 'specs', 'openspec-web-viewer', 'spec.md'), '# Spec\n')
  if (options?.extraJson) {
    fs.writeFileSync(path.join(change, 'notes.json'), '{"x":1}')
  }
  if (options?.withArchive) {
    const archived = path.join(openspec, 'changes', 'archive', 'old-change')
    fs.mkdirSync(archived, { recursive: true })
    fs.writeFileSync(path.join(archived, 'proposal.md'), '# archived\n')
  }
  return root
}

test('empty project root means OpenSpec is absent', () => {
  assert.throws(() => resolveOpenspecDir(''), (err: unknown) => {
    return err instanceof OpenspecError && err.code === 'not-openspec'
  })
  assert.deepEqual(listOpenspecFiles(''), { present: false, files: [], dirs: [] })
  assert.deepEqual(listOpenspecFiles(undefined), { present: false, files: [], dirs: [] })
})

test('missing openspec directory means OpenSpec is absent', () => {
  const root = tmpRoot()
  assert.throws(() => resolveOpenspecDir(root), (err: unknown) => {
    return err instanceof OpenspecError && err.code === 'not-openspec'
  })
  assert.deepEqual(listOpenspecFiles(root), { present: false, files: [], dirs: [] })
})

test('openspec without changes/ is still present', () => {
  const root = tmpRoot()
  fs.mkdirSync(path.join(root, 'openspec'))
  fs.writeFileSync(path.join(root, 'openspec', 'config.yaml'), 'schema: spec-driven\n')
  const listed = listOpenspecFiles(root)
  assert.equal(listed.present, true)
  assert.deepEqual(listed.files, ['config.yaml'])
  assert.deepEqual(listed.dirs, [])
})

test('empty directories under openspec are listed', () => {
  const root = tmpRoot()
  fs.mkdirSync(path.join(root, 'openspec', 'specs'), { recursive: true })
  fs.writeFileSync(path.join(root, 'openspec', 'config.yaml'), 'schema: spec-driven\n')
  const listed = listOpenspecFiles(root)
  assert.equal(listed.present, true)
  assert.deepEqual(listed.files, ['config.yaml'])
  assert.deepEqual(listed.dirs, ['specs'])
})

test('relative project root is rejected', () => {
  assert.throws(() => resolveOpenspecDir('openspec'), (err: unknown) => {
    return err instanceof OpenspecError && err.code === 'invalid-path'
  })
})

test('rejects path traversal', () => {
  const root = seedProject()
  assert.throws(
    () => resolveExistingFile(root, '../secret.md'),
    (err: unknown) => err instanceof OpenspecError && err.code === 'invalid-path',
  )
  assert.throws(
    () => resolveExistingFile(root, 'changes/../config.yaml/../../package.json'),
    (err: unknown) => err instanceof OpenspecError && err.code === 'invalid-path',
  )
})

test('lists every file under openspec including yaml, json, specs and archive', () => {
  const root = seedProject({ withArchive: true, extraJson: true })
  const listed = listOpenspecFiles(root)
  assert.equal(listed.present, true)
  assert.deepEqual(listed.files.sort(), [
    'changes/add-openspec-web-plugin/design.md',
    'changes/add-openspec-web-plugin/notes.json',
    'changes/add-openspec-web-plugin/proposal.md',
    'changes/add-openspec-web-plugin/specs/openspec-web-viewer/spec.md',
    'changes/add-openspec-web-plugin/tasks.md',
    'changes/archive/old-change/proposal.md',
    'config.yaml',
    'specs/openspec-web-viewer/spec.md',
  ])
})

test('reads and overwrites yaml and markdown under openspec', () => {
  const root = seedProject()
  assert.equal(readFile(root, 'config.yaml'), 'schema: spec-driven\n')
  writeFile(root, 'config.yaml', 'schema: custom\n')
  assert.equal(readFile(root, 'config.yaml'), 'schema: custom\n')
  writeFile(root, 'changes/add-openspec-web-plugin/proposal.md', '# Updated\n')
  assert.equal(readFile(root, 'changes/add-openspec-web-plugin/proposal.md'), '# Updated\n')
})

test('rejects missing files and does not create them', () => {
  const root = seedProject()
  const missing = path.join(root, 'openspec', 'ghost.md')
  assert.throws(
    () => resolveExistingFile(root, 'ghost.md'),
    (err: unknown) => err instanceof OpenspecError && err.code === 'not-found',
  )
  assert.equal(fs.existsSync(missing), false)
  assert.throws(
    () => writeFile(root, 'ghost.md', 'nope'),
    (err: unknown) => err instanceof OpenspecError && err.code === 'not-found',
  )
  assert.equal(fs.existsSync(missing), false)
})

test('rejects symlink that escapes the openspec directory', () => {
  const root = seedProject()
  const outside = path.join(root, 'secret.md')
  fs.writeFileSync(outside, 'secret\n')
  fs.symlinkSync(outside, path.join(root, 'openspec', 'escape.md'))
  assert.throws(
    () => resolveExistingFile(root, 'escape.md'),
    (err: unknown) => err instanceof OpenspecError && err.code === 'forbidden',
  )
})

test('write rejects traversal and leaves the original file unchanged', () => {
  const root = seedProject()
  const target = path.join(root, 'package.json')
  fs.writeFileSync(target, '{"ok":true}\n')
  const before = fs.readFileSync(target, 'utf8')
  assert.throws(
    () => writeFile(root, '../package.json', 'pwned'),
    (err: unknown) => err instanceof OpenspecError && err.code === 'invalid-path',
  )
  assert.equal(fs.readFileSync(target, 'utf8'), before)
})
