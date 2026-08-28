import type { DrillCatalogItem, DrillRecommendation } from '../api/client'
import { Card, Chip } from './site/ui'

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
    return empty ? <p className="text-sm leading-relaxed text-chalk/55">{empty}</p> : null
  }

  return (
    <section className="animate-rise space-y-4">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-display text-lg font-bold capitalize text-chalk">{heading}</h2>
        <p className="max-w-2xl text-xs leading-relaxed text-chalk/50">
          Every video here comes from the CricLab drill library and is matched to what your footage
          showed — none of it is invented.
        </p>
      </div>

      <div className="@container">
      <div className="grid gap-4 @min-[36rem]:grid-cols-2">
        {items.map((d) => {
          const yt = youtubeId(d)
          return (
            <Card key={idOf(d)} interactive={false} className="flex flex-col overflow-hidden">
              <div className="aspect-video w-full bg-night">
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
              <div className="flex flex-col gap-2.5 p-4">
                <h3 className="font-display text-sm font-bold text-chalk">{titleOf(d)}</h3>
                {'reason' in d && d.reason ? (
                  <p className="text-sm leading-relaxed text-chalk/65">{d.reason}</p>
                ) : null}
                {d.tags?.length ? (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {d.tags.map((t) => (
                      <Chip key={t}>
                        <span className="capitalize">{t.replace(/_/g, ' ')}</span>
                      </Chip>
                    ))}
                  </div>
                ) : null}
              </div>
            </Card>
          )
        })}
      </div>
      </div>
    </section>
  )
}
