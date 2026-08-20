import assert from 'node:assert/strict'
import { test } from 'node:test'
import { renderMarkdown } from '../src/client/markdown.ts'

test('empty markdown is an empty preview state', () => {
  const result = renderMarkdown('')
  assert.equal(result.empty, true)
  assert.equal(result.html, '')
})

test('renders headings and lists', () => {
  const result = renderMarkdown('# Title\n\n- one\n- two\n')
  assert.equal(result.empty, false)
  assert.match(result.html, /<h1>/)
  assert.match(result.html, /Title/)
  assert.match(result.html, /<li>/)
  assert.match(result.html, /one/)
})

test('strips script tags from preview html', () => {
  const result = renderMarkdown('# Hi\n\n<script>alert(1)</script>\n')
  assert.doesNotMatch(result.html, /<script/i)
  assert.doesNotMatch(result.html, /alert\(1\)/)
})

test('strips inline event handlers and javascript urls', () => {
  const result = renderMarkdown('<a href="javascript:alert(1)" onclick="alert(2)">x</a>')
  assert.doesNotMatch(result.html, /javascript:/i)
  assert.doesNotMatch(result.html, /onclick/i)
})
