import { createElement, useEffect, useRef, useState, type ReactElement } from 'react'
import { OpenspecViewer } from './OpenspecViewer.ts'
import {
  fallbackSessions,
  fallbackWorkspaces,
  projectRootFromSlot,
  type SessionListSnapshot,
  type WorkspaceListSnapshot,
} from './project-root.ts'
import { ensureOpenspecStyles } from './styles.ts'

export type OpenspecHeaderProps = {
  sessionId?: unknown
  useWorkspaces?: (selector: (state: WorkspaceListSnapshot) => unknown) => unknown
  useSessions?: (selector: (state: SessionListSnapshot) => unknown) => unknown
}

/**
 * Session-header OpenSpec control: a capsule beside Session log that opens a dropdown viewer.
 * @returns header button and, when open, the OpenSpec popover.
 */
export function OpenspecHeaderAction(props: OpenspecHeaderProps = {}): ReactElement {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<{ contains: (node: Node | null) => boolean } | null>(null)
  const useWorkspaces = props.useWorkspaces ?? fallbackWorkspaces
  const useSessions = props.useSessions ?? fallbackSessions
  const workspaceState = useWorkspaces(state => ({
    items: state.items ?? [],
    ready: state.baselinesReady !== false,
  })) as { items: WorkspaceListSnapshot['items']; ready: boolean }
  const sessionCwd = useSessions(state => state.byId?.[String(props.sessionId ?? '')]?.cwd)
  const projectRoot = projectRootFromSlot({
    sessionId: props.sessionId,
    workspaces: workspaceState.items,
    sessionCwd,
  })
  const projectReady = workspaceState.ready

  useEffect(() => {
    ensureOpenspecStyles()
  }, [])

  useEffect(() => {
    if (!open) return
    const onPointer = (event: Event): void => {
      const target = event.target
      if (target instanceof Node && rootRef.current?.contains(target)) return
      setOpen(false)
    }
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return createElement(
    'div',
    { ref: rootRef, className: 'dsh-openspec-root' },
    createElement(
      'button',
      {
        type: 'button',
        className: `dsh-openspec-trigger${open ? ' is-open' : ''}`,
        'aria-expanded': open,
        'aria-haspopup': 'dialog',
        onClick: () => { setOpen(current => !current) },
      },
      'OpenSpec',
    ),
    open
      ? createElement(
        'div',
        { role: 'dialog', 'aria-label': 'OpenSpec', className: 'dsh-openspec-popover' },
        createElement(OpenspecViewer, { projectRoot, projectReady }),
      )
      : null,
  )
}
