'use client'

import { AlertTriangle, X } from 'lucide-react'
import { LoadingSpinner } from './loading-state'

type ConfirmModalProps = {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Hapus',
  loading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/35 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 shrink-0 rounded-2xl bg-error-container text-error flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="confirm-title" className="text-xl font-bold text-on-surface">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{description}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={loading} className="p-2 rounded-full hover:bg-surface-container disabled:opacity-40" aria-label="Tutup modal">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button type="button" onClick={onClose} disabled={loading} className="py-3 rounded-full bg-surface-container-high font-bold disabled:opacity-40">Batal</button>
          <button type="button" onClick={onConfirm} disabled={loading} className="py-3 rounded-full bg-error text-white font-bold disabled:opacity-60">
            {loading ? <LoadingSpinner label="Menghapus..." /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
