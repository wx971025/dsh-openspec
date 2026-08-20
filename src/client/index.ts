import { OpenspecHeaderAction } from './OpenspecHeaderAction.ts'

export const inject = ['slots']

export const name = 'openspec-web-viewer-client'

export function apply(ctx: {
  slots: {
    inject: (name: string, factory: () => unknown) => void
    register: (options: Record<string, unknown>, component: unknown) => unknown
  }
}): void {
  ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
    name: 'conversation.session.header.utilities',
    id: 'openspec-web-viewer',
    order: 10,
    label: 'OpenSpec',
  }, OpenspecHeaderAction))
}
