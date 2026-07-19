const textNode = (text: string) => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text,
  version: 1,
})

const paragraphNode = (text: string) => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr' as const,
  textFormat: 0,
  children: [textNode(text)],
})

const listNode = (items: string[]) => ({
  type: 'list',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr' as const,
  listType: 'bullet' as const,
  start: 1,
  tag: 'ul' as const,
  children: items.map((text, i) => ({
    type: 'listitem',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    value: i + 1,
    children: [textNode(text)],
  })),
})

/**
 * Build richer Lexical content from an ordered mix of paragraphs and bullet lists:
 *   lexicalRich([{ p: 'Intro…' }, { ul: ['One', 'Two'] }])
 */
export function lexicalRich(blocks: Array<{ p?: string; ul?: string[] }>) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: blocks.flatMap((b): Record<string, unknown>[] => {
        if (b.ul) return [listNode(b.ul)]
        if (b.p) return [paragraphNode(b.p)]
        return []
      }),
    },
  }
}

/** Build a minimal Lexical editor state from plain paragraphs (for seeding). */
export function lexicalFromParagraphs(paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        textFormat: 0,
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text,
            version: 1,
          },
        ],
      })),
    },
  }
}
