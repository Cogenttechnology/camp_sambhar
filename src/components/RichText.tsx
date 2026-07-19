import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { cn } from '../lib/utils'

type Props = {
  data?: SerializedEditorState | null
  className?: string
}

/** Renders Payload Lexical rich-text content with our prose styling. */
export function RichText({ data, className }: Props) {
  if (!data) return null
  return <LexicalRichText data={data} className={cn('prose-body', className)} />
}
