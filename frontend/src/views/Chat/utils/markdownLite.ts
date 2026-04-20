/**
 * Lightweight markdown → structured blocks renderer.
 * Intentionally does NOT pull a full MD lib — we only need a handful of
 * production-level visual primitives for AI messages.
 *
 * Output is a sequence of typed blocks that a Vue template can render.
 */

export type MdBlock =
  | { type: 'p'; children: MdInline[] }
  | { type: 'h'; level: 1 | 2 | 3; text: string }
  | { type: 'ul'; items: MdInline[][] }
  | { type: 'ol'; items: MdInline[][] }
  | { type: 'code'; lang: string; code: string }
  | { type: 'quote'; children: MdInline[] }
  | { type: 'divider' }

export type MdInline =
  | { type: 'text'; value: string }
  | { type: 'strong'; value: string }
  | { type: 'em'; value: string }
  | { type: 'code'; value: string }
  | { type: 'link'; value: string; href: string }

function parseInline(line: string): MdInline[] {
  const out: MdInline[] = []
  // order matters: code > link > strong > em
  const pattern =
    /(`[^`]+`)|(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)|(\*[^*]+\*|_[^_]+_)/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = pattern.exec(line)) !== null) {
    if (m.index > last) out.push({ type: 'text', value: line.slice(last, m.index) })
    const token = m[0]
    if (token.startsWith('`')) {
      out.push({ type: 'code', value: token.slice(1, -1) })
    } else if (token.startsWith('[')) {
      const linkMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(token)
      if (linkMatch) out.push({ type: 'link', value: linkMatch[1], href: linkMatch[2] })
      else out.push({ type: 'text', value: token })
    } else if (token.startsWith('**')) {
      out.push({ type: 'strong', value: token.slice(2, -2) })
    } else {
      out.push({ type: 'em', value: token.slice(1, -1) })
    }
    last = m.index + token.length
  }
  if (last < line.length) out.push({ type: 'text', value: line.slice(last) })
  return out.length ? out : [{ type: 'text', value: line }]
}

export function parseMarkdown(src: string): MdBlock[] {
  if (!src) return []
  const blocks: MdBlock[] = []
  const lines = src.replace(/\r\n?/g, '\n').split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // fenced code
    if (/^```/.test(line)) {
      const lang = line.replace(/^```/, '').trim() || 'text'
      const buf: string[] = []
      i++
      while (i < lines.length && !/^```/.test(lines[i])) {
        buf.push(lines[i])
        i++
      }
      blocks.push({ type: 'code', lang, code: buf.join('\n') })
      i++
      continue
    }

    // blank line
    if (!line.trim()) {
      i++
      continue
    }

    // heading
    const h = /^(#{1,3})\s+(.+)$/.exec(line)
    if (h) {
      blocks.push({ type: 'h', level: h[1].length as 1 | 2 | 3, text: h[2].trim() })
      i++
      continue
    }

    // divider
    if (/^-{3,}$/.test(line.trim())) {
      blocks.push({ type: 'divider' })
      i++
      continue
    }

    // blockquote
    if (line.startsWith('> ')) {
      const buf: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) {
        buf.push(lines[i].slice(2))
        i++
      }
      blocks.push({ type: 'quote', children: parseInline(buf.join(' ')) })
      continue
    }

    // ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: MdInline[][] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        const text = lines[i].replace(/^\s*\d+\.\s+/, '')
        items.push(parseInline(text))
        i++
      }
      blocks.push({ type: 'ol', items })
      continue
    }

    // unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: MdInline[][] = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        const text = lines[i].replace(/^\s*[-*]\s+/, '')
        items.push(parseInline(text))
        i++
      }
      blocks.push({ type: 'ul', items })
      continue
    }

    // paragraph (may span multiple non-empty lines)
    const buf: string[] = [line]
    i++
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(```|#{1,3}\s|\s*[-*]\s|\s*\d+\.\s|>\s|-{3,}$)/.test(lines[i])
    ) {
      buf.push(lines[i])
      i++
    }
    blocks.push({ type: 'p', children: parseInline(buf.join(' ')) })
  }

  return blocks
}
