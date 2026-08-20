import assert from 'node:assert/strict'
import { test } from 'node:test'
import { OPENSPEC_STYLES } from '../src/client/styles.ts'

test('viewer styles use Harness theme aliases instead of hardcoded palette', () => {
  for (const token of [
    '--dsw-alias-bg-layer-2',
    '--dsw-alias-label-primary',
    '--dsw-alias-border-l2',
    '--dsw-alias-interactive-bg-hover',
    '--dsw-specific-sidebar-fill',
    '--dsw-alias-state-business-primary',
    '--dsw-alias-markdown-code-block',
    '--dsw-font-family',
  ]) {
    assert.match(OPENSPEC_STYLES, new RegExp(token.replaceAll('-', '\\-')))
  }
  assert.doesNotMatch(OPENSPEC_STYLES, /#[0-9a-fA-F]{3,8}/)
})
