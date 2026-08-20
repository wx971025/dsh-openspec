import fs from 'node:fs'
import path from 'node:path'

export const NO_OPENSPEC_MESSAGE = '当前项目没有 OpenSpec'

export type OpenspecErrorCode =
  | 'invalid-root'
  | 'invalid-path'
  | 'not-found'
  | 'not-file'
  | 'forbidden'
  | 'not-openspec'

export class OpenspecError extends Error {
  readonly code: OpenspecErrorCode

  constructor(code: OpenspecErrorCode, message: string) {
    super(message)
    this.name = 'OpenspecError'
    this.code = code
  }
}

function isInside(parent: string, child: string): boolean {
  const rel = path.relative(parent, child)
  return rel === '' || (!rel.startsWith(`..${path.sep}`) && rel !== '..' && !path.isAbsolute(rel))
}

export function resolveProjectRoot(projectRoot: string | undefined): string | undefined {
  if (typeof projectRoot !== 'string' || projectRoot.trim() === '') return undefined
  const trimmed = projectRoot.trim()
  if (!path.isAbsolute(trimmed)) {
    throw new OpenspecError('invalid-path', 'project root must be an absolute path')
  }
  return path.resolve(trimmed)
}

export function resolveOpenspecDir(projectRoot: string | undefined): string {
  const root = resolveProjectRoot(projectRoot)
  if (root === undefined) {
    throw new OpenspecError('not-openspec', NO_OPENSPEC_MESSAGE)
  }
  const openspec = path.join(root, 'openspec')
  if (!fs.existsSync(openspec) || !fs.statSync(openspec).isDirectory()) {
    throw new OpenspecError('not-openspec', NO_OPENSPEC_MESSAGE)
  }
  return fs.realpathSync(openspec)
}

function assertRelPath(relPath: string): void {
  if (
    !relPath
    || path.isAbsolute(relPath)
    || relPath.split(/[/\\]/).includes('..')
    || relPath.split(/[/\\]/).includes('.')
    || relPath.split(/[/\\]/).includes('')
  ) {
    throw new OpenspecError('invalid-path', 'path escapes openspec directory')
  }
}

export function resolveExistingFile(projectRoot: string | undefined, relPath: string): string {
  const openspecDir = resolveOpenspecDir(projectRoot)
  assertRelPath(relPath)
  const target = path.resolve(openspecDir, relPath)
  if (!fs.existsSync(target)) {
    throw new OpenspecError('not-found', 'file does not exist')
  }
  const real = fs.realpathSync(target)
  if (!isInside(openspecDir, real)) {
    throw new OpenspecError('forbidden', 'path escapes openspec directory')
  }
  const stat = fs.statSync(real)
  if (!stat.isFile()) {
    throw new OpenspecError('not-file', 'only files are allowed')
  }
  return real
}

function walkEntries(dir: string, prefix: string, files: string[], dirs: string[]): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const rel = prefix === '' ? entry.name : `${prefix}/${entry.name}`
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      dirs.push(rel)
      walkEntries(full, rel, files, dirs)
      continue
    }
    if (entry.isFile()) files.push(rel)
  }
}

export function listOpenspecFiles(projectRoot: string | undefined): {
  present: boolean
  files: string[]
  dirs: string[]
} {
  try {
    const openspecDir = resolveOpenspecDir(projectRoot)
    const files: string[] = []
    const dirs: string[] = []
    walkEntries(openspecDir, '', files, dirs)
    return {
      present: true,
      files: files.sort((a, b) => a.localeCompare(b)),
      dirs: dirs.sort((a, b) => a.localeCompare(b)),
    }
  } catch (error) {
    if (error instanceof OpenspecError && error.code === 'not-openspec') {
      return { present: false, files: [], dirs: [] }
    }
    throw error
  }
}

export function readFile(projectRoot: string | undefined, relPath: string): string {
  const file = resolveExistingFile(projectRoot, relPath)
  return fs.readFileSync(file, 'utf8')
}

export function writeFile(projectRoot: string | undefined, relPath: string, content: string): void {
  const file = resolveExistingFile(projectRoot, relPath)
  fs.writeFileSync(file, content, 'utf8')
}
