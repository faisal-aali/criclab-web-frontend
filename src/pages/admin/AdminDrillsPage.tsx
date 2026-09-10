import { useEffect, useMemo, useState } from 'react'
import { admin, type AdminDrill } from '../../api/admin'
import { useConfirm } from '../../components/site/ConfirmDialog'
import { Button, Card, Reveal } from '../../components/site/ui'
import { useToast } from '../../components/site/Toast'

const KNOWN_TAGS = [
  'front_leg_brace',
  'sequencing',
  'stride',
  'side_on_setup',
  'arm_speed',
  'hip_shoulder',
  'release_height',
  'line',
  'length',
]

function label(tag: string) {
  return tag.replace(/_/g, ' ')
}

const emptyForm = { title: '', youtube_id: '', tags: [] as string[] }

export function AdminDrillsPage() {
  const [items, setItems] = useState<AdminDrill[] | null>(null)
  const [catalogTags, setCatalogTags] = useState<string[]>([])
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<AdminDrill | 'new' | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [busy, setBusy] = useState(false)
  const confirm = useConfirm()
  const toast = useToast()

  const load = () => {
    admin
      .drills()
      .then((r) => {
        setItems(r.items)
        setCatalogTags(r.tags)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load drills'))
  }

  useEffect(() => {
    load()
  }, [])

  const tagOptions = useMemo(() => {
    return [...new Set([...KNOWN_TAGS, ...catalogTags])].sort()
  }, [catalogTags])

  const openNew = () => {
    setForm(emptyForm)
    setEditing('new')
  }

  const openEdit = (drill: AdminDrill) => {
    setForm({ title: drill.title, youtube_id: drill.youtube_id, tags: [...drill.tags] })
    setEditing(drill)
  }

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  const save = async () => {
    if (!form.title.trim() || !form.youtube_id.trim() || busy) return
    setBusy(true)
    try {
      if (editing === 'new') {
        await admin.createDrill({
          title: form.title.trim(),
          youtube_id: form.youtube_id.trim(),
          tags: form.tags,
        })
        toast.push('Drill added to the library.', 'ok')
      } else if (editing) {
        await admin.updateDrill(editing.id, {
          title: form.title.trim(),
          youtube_id: form.youtube_id.trim(),
          tags: form.tags,
        })
        toast.push('Drill updated.', 'ok')
      }
      setEditing(null)
      load()
    } catch (err) {
      toast.push(err instanceof Error ? err.message : 'Could not save that drill', 'error')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (drill: AdminDrill) => {
    const ok = await confirm({
      title: `Remove “${drill.title}”?`,
      body: 'Players will no longer see this video in the library or in recommendations.',
      confirmLabel: 'Remove drill',
      tone: 'danger',
    })
    if (!ok) return
    try {
      await admin.deleteDrill(drill.id)
      toast.push('Drill removed.', 'ok')
      if (editing !== 'new' && editing?.id === drill.id) setEditing(null)
      load()
    } catch (err) {
      toast.push(err instanceof Error ? err.message : 'Could not remove that drill', 'error')
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-chalk">Drill library</h1>
            <p className="pt-1.5 text-sm text-chalk/55">
              The only videos CricLab can recommend. Watch, add, edit, or remove them here.
            </p>
          </div>
          <Button onClick={openNew} size="sm">
            Add a drill
          </Button>
        </div>
      </Reveal>

      {error ? <div className="rounded-xl border border-bad/30 bg-bad/10 px-4 py-2.5 text-sm text-bad">{error}</div> : null}

      {editing ? (
        <Reveal>
          <Card tone="dark" interactive={false} className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-lime">
                  {editing === 'new' ? 'New drill' : 'Edit drill'}
                </p>
                <p className="pt-1 text-sm text-chalk/55">
                  Paste a YouTube watch URL or the 11-character id. Recommendations only use these
                  catalog ids.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="text-xs font-semibold text-chalk/45 hover:text-chalk"
              >
                Close
              </button>
            </div>
            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="flex flex-col gap-4">
                <label className="block text-xs font-semibold text-chalk/55">
                  Title
                  <input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="field field-dark mt-1.5 w-full"
                    placeholder="Front-foot block — brace at home"
                    maxLength={140}
                  />
                </label>
                <label className="block text-xs font-semibold text-chalk/55">
                  YouTube URL or id
                  <input
                    value={form.youtube_id}
                    onChange={(e) => setForm((f) => ({ ...f, youtube_id: e.target.value }))}
                    className="field field-dark mt-1.5 w-full"
                    placeholder="https://www.youtube.com/watch?v=…"
                  />
                </label>
                <div>
                  <p className="text-xs font-semibold text-chalk/55">Tags</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {tagOptions.map((tag) => {
                      const on = form.tags.includes(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize transition ${
                            on
                              ? 'border-lime/50 bg-lime/15 text-lime'
                              : 'border-white/10 bg-white/[0.03] text-chalk/55 hover:text-chalk'
                          }`}
                        >
                          {label(tag)}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button onClick={save} disabled={busy || !form.title.trim() || !form.youtube_id.trim()}>
                    {editing === 'new' ? 'Add to library' : 'Save changes'}
                  </Button>
                  <Button variant="secondary" onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-night">
                <div className="aspect-video w-full bg-white/[0.04]">
                  {form.youtube_id.trim().length >= 11 ? (
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube-nocookie.com/embed/${form.youtube_id.replace(/^.*(?:v=|youtu\.be\/|embed\/|shorts\/)/, '').slice(0, 11)}`}
                      title="Preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-xs text-chalk/35">Paste a YouTube id to preview</div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </Reveal>
      ) : null}

      {items === null && !error ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : null}

      {items && items.length === 0 ? (
        <Card tone="dark" interactive={false} className="p-10 text-center">
          <p className="font-display text-lg font-bold text-chalk">Library is empty</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-chalk/55">
            Add the first drill. Recommendations only come from this catalog.
          </p>
        </Card>
      ) : null}

      {items && items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((drill, i) => (
            <Reveal key={drill.id} delay={Math.min(i * 50, 240)}>
              <Card tone="dark" interactive={false} className="flex h-full flex-col overflow-hidden p-0">
                <div className="aspect-video w-full bg-night">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${drill.youtube_id}`}
                    title={drill.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <h2 className="font-display text-sm font-bold leading-snug text-chalk">{drill.title}</h2>
                  {drill.tags.length ? (
                    <div className="flex flex-wrap gap-1.5">
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
                  <div className="mt-auto flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => openEdit(drill)}
                      className="rounded-lg border border-white/12 px-3 py-1.5 text-xs font-semibold text-chalk/70 hover:border-lime/40 hover:text-chalk"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(drill)}
                      className="rounded-lg border border-bad/25 px-3 py-1.5 text-xs font-semibold text-bad/80 hover:bg-bad/10"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      ) : null}
    </div>
  )
}
