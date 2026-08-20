import type { IncomingMessage, ServerResponse } from 'node:http'
import { handleOpenspecHttp } from './http.ts'

export const name = 'openspec-web-viewer'

export const inject = ['webServer']

export function apply(ctx: {
  webServer: {
    register: (route: {
      kind: 'exact' | 'prefix'
      path: string
      handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>
    }) => () => void
  }
  effect: (fn: () => (() => void) | void) => void
}): void {
  ctx.effect(() => {
    const dispose = ctx.webServer.register({
      kind: 'prefix',
      path: '/openspec-viewer',
      handler: (req, res) => handleOpenspecRequest(req, res),
    })
    return dispose
  })
}

async function handleOpenspecRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const host = req.headers.host ?? '127.0.0.1'
  const url = new URL(req.url ?? '/', `http://${host}`)
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.from(chunk))
  const rawBody = Buffer.concat(chunks).toString('utf8')
  const result = await handleOpenspecHttp({
    method: req.method ?? 'GET',
    pathname: url.pathname,
    searchParams: url.searchParams,
    body: rawBody,
  })
  res.writeHead(result.status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(result.body))
}
