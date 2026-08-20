import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildFileTree } from '../src/client/file-tree.ts'

test('builds a nested tree from paths under openspec', () => {
  const tree = buildFileTree([
    'changes/demo/proposal.md',
    'config.yaml',
    'specs/note.md',
  ])
  assert.deepEqual(tree, [
    {
      name: 'changes',
      path: 'changes',
      kind: 'dir',
      children: [
        {
          name: 'demo',
          path: 'changes/demo',
          kind: 'dir',
          children: [
            { name: 'proposal.md', path: 'changes/demo/proposal.md', kind: 'file' },
          ],
        },
      ],
    },
    {
      name: 'specs',
      path: 'specs',
      kind: 'dir',
      children: [
        { name: 'note.md', path: 'specs/note.md', kind: 'file' },
      ],
    },
    { name: 'config.yaml', path: 'config.yaml', kind: 'file' },
  ])
})

test('keeps empty directories such as specs/', () => {
  const tree = buildFileTree(['config.yaml'], ['specs'])
  assert.deepEqual(tree, [
    { name: 'specs', path: 'specs', kind: 'dir', children: [] },
    { name: 'config.yaml', path: 'config.yaml', kind: 'file' },
  ])
})
