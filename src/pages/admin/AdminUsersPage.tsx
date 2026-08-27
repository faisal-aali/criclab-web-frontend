import { useCallback, useEffect, useState } from 'react'
import { admin, type AdminUserDetail, type AdminUserRow } from '../../api/admin'
import { useConfirm } from '../../components/site/ConfirmDialog'
import { Button, Card, Chip, Reveal } from '../../components/site/ui'
import { useToast } from '../../components/site/Toast'

const STATUS_FILTERS = [
  { key: '', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'disabled', label: 'Disabled' },
  { key: 'unverified', label: 'Unverified' },
]

function when(iso: string | null) {
  if (!iso) return 'Never'
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

function UserDetailPanel({
  id,
  onClose,
  onChanged,
}: {
  id: string
  onClose: () => void
  onChanged: (row: AdminUserRow) => void
}) {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null)
  const confirm = useConfirm()
  const toast = useToast()

  useEffect(() => {
    admin.userDetail(id).then(setDetail).catch(() => setDetail(null))
  }, [id])

  const toggle = async () => {
    if (!detail) return
    const next = !detail.disabled
    if (next) {
      const ok = await confirm({
        title: 'Disable this account?',
        body: `${detail.name} will not be able to sign in until this is reversed.`,
        confirmLabel: 'Disable account',
        tone: 'danger',
      })
      if (!ok) return
    }
    try {
      const { user } = await admin.setUserDisabled(id, next)
      setDetail((prev) => (prev ? { ...prev, disabled: user.disabled } : prev))
      onChanged(user)
      toast.push(next ? 'Account disabled.' : 'Account re-enabled.', 'ok')
    } catch (err) {
      toast.push(err instanceof Error ? err.message : 'Could not update that account', 'error')
    }
  }

  if (!detail) {
    return (
      <Card tone="dark" interactive={false} className="p-6">
        <div className="h-40 animate-pulse rounded-xl bg-white/5" />
      </Card>
    )
  }

  return (
    <Card tone="dark" interactive={false} className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-chalk">{detail.name}</h2>
          <p className="text-sm text-chalk/55">{detail.email}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Chip tone={detail.disabled ? 'bad' : 'ok'}>{detail.disabled ? 'Disabled' : 'Active'}</Chip>
            <Chip tone={detail.email_verified ? 'ok' : 'warn'}>
              {detail.email_verified ? 'Verified' : 'Unverified'}
            </Chip>
            {detail.role === 'admin' ? <Chip tone="lime">Admin</Chip> : null}
          </div>
        </div>
        <button type="button" onClick={onClose} className="text-xs font-semibold text-chalk/45 hover:text-chalk">
          Close
        </button>
      </div>

      <div className="grid gap-4 pt-5 text-sm sm:grid-cols-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-chalk/40">Joined</p>
          <p className="pt-0.5 text-chalk/80">{when(detail.created_at)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-chalk/40">Last seen</p>
          <p className="pt-0.5 text-chalk/80">{when(detail.last_login_at)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-chalk/40">Usage</p>
          <p className="pt-0.5 text-chalk/80">
            {detail.analysis_count} analyses · {detail.booking_count} bookings · {detail.ticket_count} tickets
          </p>
        </div>
      </div>

      <div className="grid gap-4 pt-6 sm:grid-cols-3">
        <div>
          <p className="pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/40">Recent analyses</p>
          {detail.recent_analyses.length === 0 ? (
            <p className="text-xs text-chalk/35">None yet.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {detail.recent_analyses.map((a) => (
                <li key={a.id} className="text-xs text-chalk/60">
                  {a.player_name ?? a.pipeline} · {a.status}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/40">Recent bookings</p>
          {detail.recent_bookings.length === 0 ? (
            <p className="text-xs text-chalk/35">None yet.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {detail.recent_bookings.map((b) => (
                <li key={b.id} className="text-xs text-chalk/60">
                  {b.coach_name} · {b.status}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/40">Recent tickets</p>
          {detail.recent_tickets.length === 0 ? (
            <p className="text-xs text-chalk/35">None yet.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {detail.recent_tickets.map((t) => (
                <li key={t.id} className="truncate text-xs text-chalk/60">
                  {t.subject}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {detail.role !== 'admin' ? (
        <div className="pt-6">
          <Button
            variant={detail.disabled ? 'primary' : 'secondary'}
            size="sm"
            onClick={toggle}
            className={detail.disabled ? '' : '!border-bad/40 !text-bad hover:!bg-bad/10'}
          >
            {detail.disabled ? 'Re-enable account' : 'Disable account'}
          </Button>
        </div>
      ) : null}
    </Card>
  )
}

export function AdminUsersPage() {
  const [items, setItems] = useState<AdminUserRow[] | null>(null)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string | null>(null)
  const pageSize = 20

  const load = useCallback(() => {
    admin
      .users({ search: search || undefined, status: status || undefined, page, pageSize })
      .then((r) => {
        setItems(r.items)
        setTotal(r.total)
      })
      .catch(() => setItems([]))
  }, [search, status, page])

  useEffect(() => {
    load()
  }, [load])

  const pages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <h1 className="font-display text-3xl font-extrabold text-chalk">Users</h1>
        <p className="pt-1.5 text-sm text-chalk/55">{total} accounts on the platform.</p>
      </Reveal>

      <Reveal delay={40}>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e) => {
              setPage(1)
              setSearch(e.target.value)
            }}
            placeholder="Search by name or email…"
            className="field field-dark max-w-xs"
          />
          <div className="flex gap-1.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => {
                  setPage(1)
                  setStatus(f.key)
                }}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                  status === f.key
                    ? 'border-lime/50 bg-lime/15 text-lime'
                    : 'border-white/10 bg-white/[0.03] text-chalk/60 hover:text-chalk'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {selected ? (
        <Reveal>
          <UserDetailPanel
            id={selected}
            onClose={() => setSelected(null)}
            onChanged={() => load()}
          />
        </Reveal>
      ) : null}

      <Reveal delay={80}>
        <Card tone="dark" interactive={false} className="overflow-hidden p-0">
          <div className="scroll-slim overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/8 text-[11px] uppercase tracking-[0.1em] text-chalk/40">
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Joined</th>
                  <th className="px-5 py-3 font-semibold">Last seen</th>
                  <th className="px-5 py-3 font-semibold">Usage</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {items === null ? (
                  [0, 1, 2].map((i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-5 py-3">
                        <div className="h-8 animate-pulse rounded-lg bg-white/5" />
                      </td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-chalk/40">
                      No users match that search.
                    </td>
                  </tr>
                ) : (
                  items.map((u) => (
                    <tr
                      key={u.id}
                      onClick={() => setSelected(u.id)}
                      className="cursor-pointer border-b border-white/6 transition hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-3">
                        <p className="font-semibold text-chalk">{u.name}</p>
                        <p className="text-xs text-chalk/40">{u.email}</p>
                      </td>
                      <td className="px-5 py-3 text-chalk/60">{when(u.created_at)}</td>
                      <td className="px-5 py-3 text-chalk/60">{when(u.last_login_at)}</td>
                      <td className="px-5 py-3 text-chalk/60">
                        {u.analysis_count}A · {u.booking_count}B · {u.ticket_count}T
                      </td>
                      <td className="px-5 py-3">
                        <Chip tone={u.disabled ? 'bad' : u.email_verified ? 'ok' : 'warn'}>
                          {u.disabled ? 'Disabled' : u.email_verified ? 'Active' : 'Unverified'}
                        </Chip>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-white/8 px-5 py-3 text-xs text-chalk/50">
            <span>
              Page {page} of {pages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-white/10 px-3 py-1.5 font-semibold disabled:opacity-30"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                className="rounded-lg border border-white/10 px-3 py-1.5 font-semibold disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        </Card>
      </Reveal>
    </div>
  )
}
