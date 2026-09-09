import type { ReactNode } from 'react'

/**
 * SVG path fragments for workspace nav icons. Keys match `icon` in
 * `nav.workspace.json` — JSON cannot hold JSX.
 */
const NAV_ICONS: Record<string, ReactNode> = {
  trophy: (
    <path
      d="M8 21h8M12 17v4M7 4h10v5a5 5 0 1 1-10 0V4Zm-3 2h3v4a3 3 0 0 1-3-3V6Zm16 0h-3v4a3 3 0 0 0 3-3V6Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  action: (
    <path
      d="M12 3.5v5m0 0-3 3.5m3-3.5 3 3.5M7.5 20l2-5.5m7 5.5-2-5.5M12 3.5a1.5 1.5 0 1 0 0-.01Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  flight: (
    <path
      d="M3 17c4-9 11-12 18-12M6 20h.01M9.5 20h.01M13 20h.01"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  train: (
    <path
      d="M4 9v6m16-6v6M7 7v10m10-10v10M10 12h4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  coaching: (
    <path
      d="M8 3v3m8-3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm5.5 8 1.5 1.5 3-3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  history: (
    <path
      d="M12 7v5l3 2m6-2a9 9 0 1 1-3.2-6.9M21 3v4h-4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  support: (
    <path
      d="M12 3a7 7 0 0 0-7 7v4a3 3 0 0 0 3 3h1v-6H7v-1a5 5 0 0 1 10 0v1h-2v6h1a3 3 0 0 0 3-3v-4a7 7 0 0 0-7-7Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  training: (
    <path
      d="M3 18h3l4-7 5 5 5-13v0M4 12h4l4-4 3 3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
}

export function navIcon(name: string): ReactNode {
  return NAV_ICONS[name] ?? null
}
