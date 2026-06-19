import { BrandLogo } from './brand-logo'

export function LoadingSpinner({ label = 'Memuat...' }: { label?: string }) {
  return (
    <div className="inline-flex items-center gap-3 text-on-surface-variant" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <span className="text-sm font-semibold">{label}</span>
    </div>
  )
}

export function FullPageLoading({ label = 'Menyiapkan IncluEdu...' }: { label?: string }) {
  return (
    <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center px-4">
      <div className="flex flex-col items-center text-center">
        <BrandLogo />
        <div className="mt-6">
          <LoadingSpinner label={label} />
        </div>
      </div>
    </div>
  )
}
