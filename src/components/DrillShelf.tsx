import type { DrillCatalogItem, DrillRecommendation } from '../api/client'

type Item = DrillRecommendation | (DrillCatalogItem & { reason?: string })

function youtubeId(item: Item) {
  return 'youtube_id' in item ? item.youtube_id : ''
}

function titleOf(item: Item) {
  return item.title
}

function idOf(item: Item) {
  return 'drill_id' in item ? item.drill_id : item.id
}

export function DrillShelf({
  drills,
  heading = 'Recommended drills',
  empty,
}: {
  drills?: Item[] | null
  heading?: string
  empty?: string
}) {
  const items = drills || []
  if (!items.length) {
    return empty ? <p className="text-sm text-pitch/55">{empty}</p> : null
  }

  return (
    <section className="animate-rise space-y-3">
      <h2 className="font-display text-lg font-bold text-pitch">{heading}</h2>
      <p className="text-xs text-pitch/55">
        Catalog videos only. Gemma picks IDs from this list — it does not invent YouTube links or km/h.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((d) => {
          const yt = youtubeId(d)
          return (
            <article key={idOf(d)} className="overflow-hidden rounded-2xl border border-pitch/10 bg-white shadow-sm">
              <div className="aspect-video bg-black">
                {yt ? (
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${yt}`}
                    title={titleOf(d)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : null}
              </div>
              <div className="space-y-2 p-4">
                <h3 className="font-display text-sm font-bold text-pitch">{titleOf(d)}</h3>
                {'reason' in d && d.reason ? (
                  <p className="text-sm leading-relaxed text-pitch/75">{d.reason}</p>
                ) : null}
                {d.tags?.length ? (
                  <p className="flex flex-wrap gap-1">
                    {d.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-mist px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-pitch/60"
                      >
                        {t.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </p>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
