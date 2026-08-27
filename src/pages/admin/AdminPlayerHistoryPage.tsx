import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { admin, adminResultHref, fmtKmh, type PlayerHistoryItem } from '../../api/admin'
import { OpenReportButton } from '../../components/admin/OpenReportButton'
import { Card, Chip, Reveal } from '../../components/site/ui'

function when(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdminPlayerHistoryPage() {
  const { userId } = useParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [items, setItems] = useState<PlayerHistoryItem[] | null>(null)

  useEffect(() => {
    if (!userId) return
    admin
      .userHistory(userId)
      .then((r) => {
        setName(r.user.name)
        setEmail(r.user.email)
        setItems(r.items)
      })
      .catch(() => setItems([]))
  }, [userId])

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <Link to="/admin/users" className="text-xs font-semibold text-chalk/45 hover:text-chalk">
          ← Users
        </Link>
        <h1 className="font-display pt-2 text-3xl font-extrabold text-chalk">{name || 'Player history'}</h1>
        <p className="pt-1.5 text-sm text-chalk/55">
          {email ? `${email} · ` : ''}
          {items ? `${items.length} sessions` : 'Loading…'} — the same reports the player sees.
        </p>
      </Reveal>

      <Reveal delay={40}>
        <div className="flex flex-col gap-3">
          {items === null ? (
            [0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/5" />)
          ) : items.length === 0 ? (
            <Card tone="dark" interactive={false} className="p-8 text-center text-sm text-chalk/40">
              This account has no analysed deliveries yet.
            </Card>
          ) : (
            items.map((d) => {
              const href = adminResultHref(d.pipeline, d.result_id)
              const threw = [d.delivery_type, d.bowling_arm ? `${d.bowling_arm}-arm` : null, d.bowling_style]
                .filter(Boolean)
                .join(' · ')
              return (
                <Card
                  key={d.id}
                  tone="dark"
                  interactive={false}
                  className="flex flex-wrap items-center justify-between gap-4 p-5"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-lg font-bold text-chalk">{d.player_name || 'Bowler'}</p>
                      <Chip tone="neutral">{d.pipeline === 'action' ? 'Action' : 'Ball flight'}</Chip>
                      {d.delivery_type ? <Chip tone="lime">{d.delivery_type}</Chip> : null}
                    </div>
                    <p className="pt-1 text-xs text-chalk/45">
                      {when(d.created_at)}
                      {threw ? ` · ${threw}` : ''}
                      {d.pipeline === 'ball_flight' ? ` · ${d.delivery_count} tracked` : ''}
                    </p>
                    {d.summary ? <p className="line-clamp-2 pt-2 text-sm text-chalk/60">{d.summary}</p> : null}
                  </div>
                  <div className="ml-auto flex shrink-0 items-center gap-4">
                    {d.pipeline === 'action' ? (
                      <div className="text-right">
                        <p className="font-display text-2xl font-extrabold text-lime">{fmtKmh(d.ball_speed_kmh)}</p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-chalk/40">ball km/h</p>
                        <p className="pt-1 text-xs text-chalk/50">arm {fmtKmh(d.arm_speed_kmh)}</p>
                      </div>
                    ) : null}
                    {href ? <OpenReportButton to={href} /> : null}
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </Reveal>
    </div>
  )
}
