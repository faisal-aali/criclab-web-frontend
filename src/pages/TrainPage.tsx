import { useEffect, useMemo, useState } from 'react'
import { listDrills, type DrillCatalogItem } from '../api/client'
import { DrillShelf } from '../components/DrillShelf'

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

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-seam">Train</p>
        <h1 className="font-display mt-1 text-4xl font-extrabold text-pitch">Drill library</h1>
        <p className="mt-2 max-w-2xl text-sm text-pitch/65">
          Browse the closed catalog. After an Action or Ball flight upload, Gemma only picks from these IDs — it never
          invents YouTube links or speeds.
        </p>
      </div>

      {error ? <p className="text-ball">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActive('all')}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            active === 'all' ? 'bg-pitch text-white' : 'bg-white text-pitch/70 ring-1 ring-pitch/15'
          }`}
        >
          All
        </button>
        {tags.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActive(t)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              active === t ? 'bg-pitch text-white' : 'bg-white text-pitch/70 ring-1 ring-pitch/15'
            }`}
          >
            {t.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <DrillShelf drills={filtered} heading={active === 'all' ? 'All catalog videos' : active.replace(/_/g, ' ')} />
    </section>
  )
}
