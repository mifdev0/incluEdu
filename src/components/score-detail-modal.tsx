'use client'

import { X } from 'lucide-react'
import type { ScoreDetail } from '@/lib/score-breakdown'

type ScoreDetailModalProps = {
  open: boolean
  title: string
  score: number
  period: string
  details: ScoreDetail[]
  formula: string
  onClose: () => void
}

export function ScoreDetailModal({ open, title, score, period, details, formula, onClose }: ScoreDetailModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/35 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-xl max-h-[88vh] overflow-y-auto rounded-3xl bg-white p-5 sm:p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-primary">Rincian perhitungan</div>
            <h2 className="text-xl font-bold mt-1">{title} — {score}</h2>
            <p className="text-sm text-on-surface-variant mt-1">{period}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container" aria-label="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>

        {details.length > 0 ? (
          <div className="mt-5 overflow-hidden rounded-2xl border border-outline-variant/20">
            <div className="grid grid-cols-[1fr_72px] bg-surface-container-low px-4 py-3 text-xs font-bold text-on-surface-variant">
              <span>Indikator dan jawaban</span>
              <span className="text-right">Bobot</span>
            </div>
            {details.map((detail) => (
              <div key={detail.key} className="grid grid-cols-[1fr_72px] gap-3 border-t border-outline-variant/15 px-4 py-3">
                <div>
                  <div className="text-sm font-bold">{detail.label}</div>
                  <div className="text-sm text-on-surface-variant mt-0.5">{detail.answer}</div>
                </div>
                <div className="text-right text-lg font-bold text-primary">{detail.weight}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
            Tidak ada indikator khusus pada aspek ini. Sistem menggunakan nilai dasar observasi sebesar {score}.
          </div>
        )}

        <div className="mt-4 rounded-2xl bg-primary/5 p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-primary">Rumus</div>
          <p className="text-sm mt-1">{formula}</p>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">
          Nilai menggambarkan hasil observasi siswa pada periode ini dan tidak digunakan untuk membandingkan dengan siswa lain.
        </p>
      </div>
    </div>
  )
}
