export interface MarkdownRender {
  html: string
  empty: boolean
}

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script\b[^>]*\/?>/gi, '')
    .replace(/<(iframe|object|embed|link|meta|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(iframe|object|embed|link|meta|style)\b[^>]*\/?>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, '$1="#"')
}

function markdownToHtml(source: string): string {
  const lines = source.replaceAll('\r\n', '\n').split('\n')
  const out: string[] = []
  let inList = false
  const flushList = (): void => {
    if (!inList) return
    out.push('</ul>')
    inList = false
  }
  for (const line of lines) {
    const heading = /^(#{1,6})\s+(.+)$/.exec(line)
    if (heading) {
      flushList()
      const level = heading[1].length
      out.push(`<h${level}>${escapeHtml(heading[2])}</h${level}>`)
      continue
    }
    const item = /^[-*]\s+(.+)$/.exec(line)
    if (item) {
      if (!inList) {
        out.push('<ul>')
        inList = true
      }
      out.push(`<li>${escapeHtml(item[1])}</li>`)
      continue
    }
    if (line.trim() === '') {
      flushList()
      continue
    }
    flushList()
    out.push(`<p>${line}</p>`)
  }
  flushList()
  return out.join('')
}

export function renderMarkdown(source: string): MarkdownRender {
  if (source.trim() === '') return { html: '', empty: true }
  return { html: sanitizeHtml(markdownToHtml(source)), empty: false }
}
