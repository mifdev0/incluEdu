import Image from 'next/image'

type BrandLogoProps = {
  compact?: boolean
  className?: string
}

export function BrandLogo({ compact = false, className = '' }: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`${compact ? 'w-9 h-9' : 'w-11 h-11'} shrink-0 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-sm`}>
        <Image
          src="/logo.png"
          alt=""
          width={compact ? 36 : 44}
          height={compact ? 36 : 44}
          className="w-full h-full object-contain scale-125"
          priority
        />
      </span>
      <span className="font-headline-sm text-headline-sm font-bold text-primary leading-none">IncluEdu</span>
    </span>
  )
}
