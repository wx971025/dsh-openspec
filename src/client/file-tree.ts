export type FileTreeNode = {
  name: string
  path: string
  kind: 'file' | 'dir'
  children?: FileTreeNode[]
}

/**
 * Turn a flat list of POSIX-relative paths into a nested file tree.
 * Directories sort before files at each level.
 */
export function buildFileTree(files: string[], dirs: string[] = []): FileTreeNode[] {
  const root: FileTreeNode[] = []
  const dirNodes = new Map<string, FileTreeNode>()

  function ensureDir(dirPath: string): FileTreeNode[] {
    if (dirPath === '') return root
    const existing = dirNodes.get(dirPath)
    if (existing?.children) return existing.children
    const parts = dirPath.split('/')
    const name = parts[parts.length - 1] ?? dirPath
    const parentPath = parts.slice(0, -1).join('/')
    const siblings = ensureDir(parentPath)
    const node: FileTreeNode = { name, path: dirPath, kind: 'dir', children: [] }
    siblings.push(node)
    dirNodes.set(dirPath, node)
    return node.children ?? []
  }

  for (const dirPath of dirs) ensureDir(dirPath)

  for (const file of files) {
    const parts = file.split('/')
    const name = parts[parts.length - 1] ?? file
    const parent = parts.slice(0, -1).join('/')
    ensureDir(parent).push({ name, path: file, kind: 'file' })
  }

  function sortNodes(nodes: FileTreeNode[]): FileTreeNode[] {
    nodes.sort((left, right) => {
      if (left.kind !== right.kind) return left.kind === 'dir' ? -1 : 1
      return left.name.localeCompare(right.name)
    })
    for (const node of nodes) {
      if (node.children) sortNodes(node.children)
    }
    return nodes
  }

  return sortNodes(root)
}
