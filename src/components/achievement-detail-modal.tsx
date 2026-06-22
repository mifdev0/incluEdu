'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, X } from 'lucide-react'

export type AchievementDetail = {
  id: string
  area: string
  goal: string
  phase: string | null
  value: number
  target: number
  criterion: string | null
  formula: string
  evidence: string[]
}

type Props = {
  open: boolean
  title: string
  score: number
  description: string
  details: AchievementDetail[]
  onClose: () => void
}

export function AchievementDetailModal({ open, title, score, description, details, onClose }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  if (!open) return null
  const averageFormula = details.length
    ? `(${details.map((item) => item.value).join(' + ')}) ÷ ${details.length} = ${score}%`
    : 'Belum ada target pada kelompok ini.'

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/35 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
    <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div><div className="text-xs font-bold text-primary">TRANSPARANSI NILAI</div><h2 className="mt-1 text-xl font-bold">{title} — {score}%</h2><p className="mt-1 text-sm text-on-surface-variant">{description}</p></div>
        <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-surface-container" aria-label="Tutup"><X className="h-5 w-5" /></button>
      </div>

      {details.length > 0 ? <div className="mt-5 space-y-3">{details.map((detail) => <section key={detail.id} className="rounded-2xl border border-outline-variant/20 p-4">
        <div className="flex items-start justify-between gap-4"><div><div className="text-xs font-bold text-primary">{detail.area}{detail.phase ? ` · CP Fase ${detail.phase}` : ''}</div><div className="mt-1 font-bold">{detail.goal}</div><div className="mt-1 text-xs text-on-surface-variant">{detail.criterion || `Target minimal ${detail.target}%`}</div></div><div className="text-2xl font-bold">{detail.value}%</div></div>
        <div className="mt-3 rounded-2xl bg-surface-container-low p-3"><div className="text-xs font-bold text-on-surface-variant">SUMBER DAN RUMUS TARGET</div><p className="mt-1 text-sm">{detail.formula}</p>
          {detail.evidence.length > 0 && <>
            <button type="button" onClick={() => toggle(detail.id)} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary">
              {expanded.has(detail.id) ? <><ChevronDown className="h-3 w-3" /> Sembunyikan log</> : <><ChevronRight className="h-3 w-3" /> Tampilkan log ({detail.evidence.length})</>}
            </button>
            {expanded.has(detail.id) && <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-on-surface-variant">{detail.evidence.map((item) => <li key={item}>{item}</li>)}</ul>}
          </>}
        </div>
      </section>)}</div> : <div className="mt-5 rounded-2xl bg-surface-container-low p-4 text-sm text-on-surface-variant">Belum ada target yang dapat dihitung.</div>}

      <div className="mt-4 rounded-2xl bg-primary/5 p-4"><div className="text-xs font-bold text-primary">RUMUS RINGKASAN</div><p className="mt-1 text-sm">{averageFormula}</p></div>
      <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">Nilai dihitung dari target PPI siswa sendiri, bukan dibandingkan dengan siswa lain atau standar kelas.</p>
    </div>
  </div>
}
