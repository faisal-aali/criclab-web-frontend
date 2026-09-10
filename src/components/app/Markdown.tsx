/**
 * A small, controlled Markdown renderer for assistant messages.
 *
 * Not a general-purpose Markdown library — a fixed subset matched to what the
 * assistant is actually asked to produce (see `SYSTEM_PROMPT` in the backend):
 * headings, short paragraphs, numbered and bulleted steps, bold, inline code,
 * fenced code, callouts, and links restricted to the app's own routes.
 *
 * "Safely" here means never interpreting raw HTML from the text at all — every
 * token is parsed into a specific React element, so there is no path from
 * model output to an injected tag the way `dangerouslySetInnerHTML` would
 * open up. A dependency was deliberately not pulled in for this: the subset
 * needed is small enough that hand-rolling it is less surface area than
 * configuring a general Markdown+sanitizer pipeline to be exactly as narrow.
 */
import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Block =
  | { kind: 'heading'; level: 2 | 3; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'code'; text: string }
  | { kind: 'callout'; lead: string; text: string }
  | { kind: 'p'; text: string }

const ORDERED_RE = /^\d+[.)]\s+/
const BULLET_RE = /^[-*]\s+/
const CALLOUT_RE = /^\*\*([A-Za-z][\w /]{0,20}):\*\*\s*(.*)$/

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) {
      i++
      continue
    }

    if (line.startsWith('```')) {
      const body: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        body.push(lines[i])
        i++
      }
      i++ // closing fence
      blocks.push({ kind: 'code', text: body.join('\n') })
      continue
    }

    const heading = /^(#{2,3})\s+(.*)$/.exec(line)
    if (heading) {
      blocks.push({ kind: 'heading', level: heading[1].length as 2 | 3, text: heading[2].trim() })
      i++
      continue
    }

    if (BULLET_RE.test(line)) {
      const items: string[] = []
      while (i < lines.length && BULLET_RE.test(lines[i])) {
        items.push(lines[i].replace(BULLET_RE, '').trim())
        i++
      }
      blocks.push({ kind: 'ul', items })
      continue
    }

    if (ORDERED_RE.test(line)) {
      const items: string[] = []
      while (i < lines.length && ORDERED_RE.test(lines[i])) {
        items.push(lines[i].replace(ORDERED_RE, '').trim())
        i++
      }
      blocks.push({ kind: 'ol', items })
      continue
    }

    // A paragraph runs until the next blank line or the start of a new block.
    const para: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !BULLET_RE.test(lines[i]) &&
      !ORDERED_RE.test(lines[i]) &&
      !lines[i].startsWith('```') &&
      !/^#{2,3}\s+/.test(lines[i])
    ) {
      para.push(lines[i])
      i++
    }
    const text = para.join(' ').trim()
    const callout = CALLOUT_RE.exec(text)
    if (callout) {
      blocks.push({ kind: 'callout', lead: callout[1], text: callout[2] })
    } else if (text) {
      blocks.push({ kind: 'p', text })
    }
  }

  return blocks
}

/** Bold, inline code, and links — the only inline syntax the assistant uses. */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  // bold | code | link, tried in that order at each position
  const re = /\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = re.exec(text))) {
    if (match.index > last) nodes.push(<Fragment key={`${keyPrefix}-t${key++}`}>{text.slice(last, match.index)}</Fragment>)
    if (match[1] !== undefined) {
      nodes.push(
        <strong key={`${keyPrefix}-b${key++}`} className="font-semibold text-chalk">
          {match[1]}
        </strong>,
      )
    } else if (match[2] !== undefined) {
      nodes.push(
        <code key={`${keyPrefix}-c${key++}`} className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[12px]">
          {match[2]}
        </code>,
      )
    } else if (match[3] !== undefined && match[4] !== undefined) {
      const label = match[3]
      const href = match[4].trim()
      const internal = href.startsWith('/')
      nodes.push(
        internal ? (
          <Link
            key={`${keyPrefix}-l${key++}`}
            to={href}
            className="font-semibold text-lime underline decoration-lime/40 underline-offset-2 transition hover:text-lime-deep hover:decoration-lime-deep"
          >
            {label}
          </Link>
        ) : (
          <a
            key={`${keyPrefix}-l${key++}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-lime underline decoration-lime/40 underline-offset-2 transition hover:text-lime-deep hover:decoration-lime-deep"
          >
            {label}
          </a>
        ),
      )
    }
    last = match.index + match[0].length
  }
  if (last < text.length) nodes.push(<Fragment key={`${keyPrefix}-t${key++}`}>{text.slice(last)}</Fragment>)
  return nodes
}

export function Markdown({ text }: { text: string }) {
  const blocks = parseBlocks(text || '')

  return (
    <div className="flex flex-col gap-2.5">
      {blocks.map((block, i) => {
        const key = `b${i}`
        switch (block.kind) {
          case 'heading':
            return block.level === 2 ? (
              <h3 key={key} className="font-display text-[15px] font-bold text-chalk">
                {renderInline(block.text, key)}
              </h3>
            ) : (
              <h4 key={key} className="font-display text-sm font-bold text-chalk">
                {renderInline(block.text, key)}
              </h4>
            )
          case 'ul':
            return (
              <ul key={key} className="flex flex-col gap-1.5 pl-1">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-lime/70" aria-hidden />
                    <span>{renderInline(item, `${key}-${j}`)}</span>
                  </li>
                ))}
              </ul>
            )
          case 'ol':
            return (
              <ol key={key} className="flex flex-col gap-1.5 pl-1">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-2.5">
                    <span className="mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full bg-lime/15 text-[10px] font-bold text-lime">
                      {j + 1}
                    </span>
                    <span>{renderInline(item, `${key}-${j}`)}</span>
                  </li>
                ))}
              </ol>
            )
          case 'code':
            return (
              <pre
                key={key}
                className="overflow-x-auto rounded-lg border border-white/10 bg-night/60 p-3 font-mono text-[12px] leading-relaxed text-chalk/85"
              >
                <code>{block.text}</code>
              </pre>
            )
          case 'callout':
            return (
              <div
                key={key}
                className="flex gap-2 rounded-lg border border-lime/20 bg-lime/[0.06] px-3 py-2 text-[13px]"
              >
                <span className="shrink-0 font-semibold text-lime">{block.lead}:</span>
                <span>{renderInline(block.text, key)}</span>
              </div>
            )
          case 'p':
          default:
            return <p key={key}>{renderInline(block.text, key)}</p>
        }
      })}
    </div>
  )
}
