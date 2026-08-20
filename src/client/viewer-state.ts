export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error' | 'disconnected'
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
export type ViewMode = 'preview' | 'edit'

export interface ViewerState {
  loadStatus: LoadStatus
  loadError?: string
  present: boolean
  files: string[]
  dirs: string[]
  selected: string | null
  mode: ViewMode
  content: string
  draft: string
  saving: boolean
  saveStatus: SaveStatus
  saveError?: string
}

export type ViewerAction =
  | { type: 'load-start' }
  | { type: 'load-success'; files: string[]; dirs?: string[]; present?: boolean }
  | { type: 'load-error'; error: string; disconnected?: boolean }
  | { type: 'select'; path: string }
  | { type: 'file-loaded'; content: string }
  | { type: 'file-error'; error: string }
  | { type: 'set-mode'; mode: ViewMode }
  | { type: 'edit'; draft: string }
  | { type: 'save-start' }
  | { type: 'save-success' }
  | { type: 'save-error'; error: string }

export const NO_OPENSPEC_BANNER = '当前项目没有 OpenSpec'

export const initialViewerState: ViewerState = {
  loadStatus: 'idle',
  present: false,
  files: [],
  dirs: [],
  selected: null,
  mode: 'preview',
  content: '',
  draft: '',
  saving: false,
  saveStatus: 'idle',
}

export function reduceViewer(state: ViewerState, action: ViewerAction): ViewerState {
  switch (action.type) {
    case 'load-start':
      return { ...state, loadStatus: 'loading', loadError: undefined }
    case 'load-success':
      return {
        ...state,
        loadStatus: 'ready',
        loadError: undefined,
        present: action.present !== false,
        files: action.files,
        dirs: action.dirs ?? [],
      }
    case 'load-error':
      return {
        ...state,
        loadStatus: action.disconnected === true ? 'disconnected' : 'error',
        loadError: action.error,
        present: false,
        files: [],
        dirs: [],
        saveStatus: 'idle',
        saving: false,
      }
    case 'select':
      return {
        ...state,
        selected: action.path,
        mode: 'preview',
        content: '',
        draft: '',
        saveStatus: 'idle',
        saveError: undefined,
      }
    case 'file-loaded':
      return {
        ...state,
        content: action.content,
        draft: action.content,
        saveStatus: 'idle',
        saveError: undefined,
      }
    case 'file-error':
      return { ...state, loadError: action.error, content: '', draft: '' }
    case 'set-mode':
      return { ...state, mode: action.mode }
    case 'edit':
      return { ...state, draft: action.draft, saveStatus: 'idle', saveError: undefined }
    case 'save-start':
      return { ...state, saving: true, saveStatus: 'saving', saveError: undefined }
    case 'save-success':
      return {
        ...state,
        saving: false,
        saveStatus: 'saved',
        content: state.draft,
        saveError: undefined,
      }
    case 'save-error':
      return {
        ...state,
        saving: false,
        saveStatus: 'error',
        saveError: action.error,
      }
    default:
      return state
  }
}

export function selectView(state: ViewerState): {
  showTree: boolean
  banner?: string
  saved: boolean
} {
  const showTree = state.loadStatus === 'ready' && state.present
  const banner = state.loadStatus === 'error' || state.loadStatus === 'disconnected'
    ? state.loadError
    : state.loadStatus === 'ready' && !state.present
      ? NO_OPENSPEC_BANNER
      : undefined
  const saved = state.saveStatus === 'saved' && !state.saving && state.draft === state.content
  return { showTree, banner, saved }
}

export function isMarkdownPath(filePath: string): boolean {
  return filePath.toLowerCase().endsWith('.md')
}
