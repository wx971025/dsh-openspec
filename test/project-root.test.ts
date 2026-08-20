import assert from 'node:assert/strict'
import { test } from 'node:test'
import { projectRootFromSlot } from '../src/client/project-root.ts'

test('uses the workspace path that accounts for the current session', () => {
  const root = projectRootFromSlot({
    sessionId: 's1',
    workspaces: [
      { path: '/other', sessionIds: ['s2'] },
      { path: '/proj', sessionIds: ['s1', 's3'] },
    ],
    sessionCwd: '/ignored',
  })
  assert.equal(root, '/proj')
})

test('falls back to session cwd when no workspace accounts for the session', () => {
  const root = projectRootFromSlot({
    sessionId: 's1',
    workspaces: [{ path: '/other', sessionIds: ['s2'] }],
    sessionCwd: '/from-cwd',
  })
  assert.equal(root, '/from-cwd')
})

test('returns undefined when the session has no project directory', () => {
  const root = projectRootFromSlot({
    sessionId: 's1',
    workspaces: [{ path: '/other', sessionIds: ['s2'] }],
  })
  assert.equal(root, undefined)
})
