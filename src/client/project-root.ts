export type WorkspaceItem = {
  path?: unknown
  sessionIds?: readonly unknown[]
}

export type WorkspaceListSnapshot = {
  items?: readonly WorkspaceItem[]
  baselinesReady?: boolean
}

export type SessionListSnapshot = {
  byId?: Record<string, { cwd?: unknown } | undefined>
}

/**
 * Resolve the current session's project directory from slot workspace/session facts.
 * Prefers the workspace that accounts for this session, then the session cwd.
 */
export function projectRootFromSlot(input: {
  sessionId?: unknown
  workspaces?: readonly WorkspaceItem[]
  sessionCwd?: unknown
}): string | undefined {
  const sessionId = input.sessionId == null ? '' : String(input.sessionId)
  const fromWorkspace = input.workspaces?.find(workspace =>
    Array.isArray(workspace.sessionIds)
    && workspace.sessionIds.some(id => String(id) === sessionId),
  )?.path
  if (typeof fromWorkspace === 'string' && fromWorkspace.trim() !== '') return fromWorkspace.trim()
  if (typeof input.sessionCwd === 'string' && input.sessionCwd.trim() !== '') return input.sessionCwd.trim()
  return undefined
}

export function fallbackWorkspaces<T>(selector: (state: WorkspaceListSnapshot) => T): T {
  return selector({ items: [], baselinesReady: true })
}

export function fallbackSessions<T>(selector: (state: SessionListSnapshot) => T): T {
  return selector({ byId: {} })
}
