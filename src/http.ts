import {
  OpenspecError,
  listOpenspecFiles,
  NO_OPENSPEC_MESSAGE,
  readFile,
  writeFile,
} from './openspec-fs.ts'

export interface HttpInput {
  method: string
  pathname: string
  searchParams: URLSearchParams
  body?: string
}

export interface HttpResult {
  status: number
  body: unknown
}

function statusFor(error: OpenspecError): number {
  if (error.code === 'not-openspec') return 404
  if (error.code === 'invalid-root') return 400
  if (error.code === 'forbidden' || error.code === 'invalid-path') return 403
  if (error.code === 'not-found' || error.code === 'not-file') return 404
  return 400
}

function fail(error: unknown): HttpResult {
  if (error instanceof OpenspecError) {
    return { status: statusFor(error), body: { error: error.message, code: error.code } }
  }
  const message = error instanceof Error ? error.message : 'unexpected error'
  return { status: 500, body: { error: message } }
}

function routeTail(pathname: string): string {
  const prefix = '/openspec-viewer'
  if (pathname === prefix) return ''
  if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length)
  return pathname
}

function parseJsonBody(raw: string | undefined): Record<string, unknown> | undefined {
  if (!raw) return undefined
  try {
    const parsed: unknown = JSON.parse(raw)
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
  } catch {
    return undefined
  }
  return undefined
}

function requestRoot(input: HttpInput, payload?: Record<string, unknown>): string | undefined {
  const fromQuery = input.searchParams.get('root')
  if (fromQuery) return fromQuery
  const fromBody = payload?.root
  return typeof fromBody === 'string' ? fromBody : undefined
}

export async function handleOpenspecHttp(input: HttpInput): Promise<HttpResult> {
  const method = input.method.toUpperCase()
  const tail = routeTail(input.pathname)

  try {
    if (method === 'GET' && (tail === '/tree' || tail === '/changes')) {
      const listed = listOpenspecFiles(requestRoot(input))
      if (!listed.present) {
        return { status: 200, body: { present: false, files: [], dirs: [], message: NO_OPENSPEC_MESSAGE } }
      }
      return { status: 200, body: { present: true, files: listed.files, dirs: listed.dirs } }
    }

    if (method === 'GET' && tail === '/file') {
      const relPath = input.searchParams.get('path') ?? ''
      const content = readFile(requestRoot(input), relPath)
      return { status: 200, body: { content } }
    }

    if (method === 'PUT' && tail === '/file') {
      const payload = parseJsonBody(input.body)
      if (payload === undefined) {
        return { status: 400, body: { error: 'invalid JSON body' } }
      }
      if (typeof payload.content !== 'string') {
        return { status: 400, body: { error: 'content must be a string' } }
      }
      const relPath = typeof payload.path === 'string' ? payload.path : ''
      writeFile(requestRoot(input, payload), relPath, payload.content)
      return { status: 200, body: { ok: true } }
    }

    return { status: 404, body: { error: 'not found' } }
  } catch (error) {
    return fail(error)
  }
}
