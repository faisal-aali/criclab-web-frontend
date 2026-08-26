import { useEffect, useMemo, useState } from 'react'
import { listDrills, type DrillCatalogItem } from '../api/client'
import { Card, Chip, Reveal } from '../components/site/ui'

function label(tag: string) {
  return tag.replace(/_/g, ' ')
}

function DrillTile({ drill }: { drill: DrillCatalogItem }) {
  return (
    <Card interactive={false} className="flex h-full flex-col overflow-hidden p-0">
      <div className="aspect-video w-full bg-night">
        {drill.youtube_id ? (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${drill.youtube_id}`}
            title={drill.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3 className="font-display text-sm font-bold leading-snug text-chalk">{drill.title}</h3>
        {drill.tags?.length ? (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {drill.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-chalk/55"
              >
                {label(t)}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  )
}

export function TrainPage() {
  const [items, setItems] = useState<DrillCatalogItem[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [active, setActive] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listDrills()
      .then((res) => {
        setItems(res.items)
        setTags(res.tags)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load drills'))
  }, [])

  const filtered = useMemo(() => {
    if (active === 'all') return items
    return items.filter((d) => d.tags.includes(active))
  }, [items, active])

  /**
   * Presentation only: the same drills, shelved by their leading tag so the
   * library reads as categories rather than one long wall of thumbnails.
   * Every drill appears exactly once, in the same set the filter produced.
   */
  const groups = useMemo(() => {
    const map = new Map<string, DrillCatalogItem[]>()
    for (const d of filtered) {
      const key = active === 'all' ? d.tags[0] || 'general' : active
      const bucket = map.get(key)
      if (bucket) bucket.push(d)
      else map.set(key, [d])
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [filtered, active])

  const loading = items.length === 0 && !error

  return (
    <div className="space-y-7">
      {/* ---------------- Header ---------------- */}
      <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <Chip tone="lime">Train</Chip>
          <h1 className="font-display mt-3 text-3xl font-extrabold leading-tight text-chalk sm:text-4xl">
            Drill <span className="text-gradient-lime">library</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-chalk/60">
            Every drill CricLab can put in front of you, in one place. After an Action or Ball
            flight session, your recommendations are chosen from this library and nothing else —
            no invented videos, no invented numbers.
          </p>
        </div>
        {items.length ? (
          <div className="shrink-0 self-start sm:self-auto">
            <Chip>{items.length} drills</Chip>
          </div>
        ) : null}
      </Reveal>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-bad/30 bg-bad/10 px-4 py-3.5 text-sm text-bad"
        >
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-bad/20 text-[11px] font-bold">
            !
          </span>
          <span className="min-w-0 break-words">{error}</span>
        </div>
      ) : null}

      {/* ---------------- Category filter ---------------- */}
      {tags.length ? (
        <div className="scroll-slim -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <button
            type="button"
            onClick={() => setActive('all')}
            aria-pressed={active === 'all'}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              active === 'all'
                ? 'border-lime bg-lime text-night'
                : 'border-white/12 bg-white/5 text-chalk/65 hover:border-lime/40 hover:text-chalk'
            }`}
          >
            All drills
          </button>
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActive(t)}
              aria-pressed={active === t}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                active === t
                  ? 'border-lime bg-lime text-night'
                  : 'border-white/12 bg-white/5 text-chalk/65 hover:border-lime/40 hover:text-chalk'
              }`}
            >
              {label(t)}
            </button>
          ))}
        </div>
      ) : null}

      {/* ---------------- Library ---------------- */}
      {loading ? (
        <div className="space-y-3">
          <p className="text-sm text-chalk/50">Loading the drill library…</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-white/[0.04]"
              >
                <div className="aspect-video w-full bg-white/[0.05]" />
                <div className="space-y-2 p-4">
                  <div className="h-3.5 w-3/4 rounded bg-white/10" />
                  <div className="h-3 w-1/3 rounded bg-white/[0.07]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : groups.length === 0 ? (
        <Card interactive={false} className="p-8 text-center sm:p-10">
          <p className="font-display text-lg font-bold text-chalk">Nothing filed under this tag</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-chalk/55">
            No drills are tagged{' '}
            <span className="font-semibold capitalize text-chalk/80">{label(active)}</span> yet.
            Try another category.
          </p>
          <button
            type="button"
            onClick={() => setActive('all')}
            className="mt-5 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-chalk transition hover:border-lime/50"
          >
            Show all drills
          </button>
        </Card>
      ) : (
        <div className="space-y-9">
          {groups.map(([group, list], gi) => (
            <section key={group} className="space-y-3.5">
              <div className="flex flex-wrap items-center gap-3 border-b border-white/8 pb-3">
                <h2 className="font-display text-lg font-bold capitalize text-chalk">
                  {label(group)}
                </h2>
                <Chip>{list.length}</Chip>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((d, i) => (
                  <Reveal key={d.id} delay={Math.min(i * 60 + gi * 30, 240)} className="h-full">
                    <DrillTile drill={d} />
                  </Reveal>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
