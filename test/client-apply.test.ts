import assert from 'node:assert/strict'
import { test } from 'node:test'
import { apply, inject, name } from '../src/client/index.ts'

test('client apply injects a header utility beside session log', () => {
  assert.deepEqual(inject, ['slots'])
  assert.equal(typeof name, 'string')
  const registrations: Array<{ options: Record<string, unknown> }> = []
  const ctx = {
    slots: {
      inject(slotName: string, factory: () => unknown) {
        assert.equal(slotName, 'conversation.session.header.utilities')
        factory()
      },
      register(options: Record<string, unknown>, component: unknown) {
        registrations.push({ options })
        assert.equal(typeof component, 'function')
        return options
      },
    },
  }
  apply(ctx)
  assert.equal(registrations.length, 1)
  assert.equal(registrations[0].options.name, 'conversation.session.header.utilities')
  assert.equal(registrations[0].options.id, 'openspec-web-viewer')
  assert.equal(registrations[0].options.label, 'OpenSpec')
})
