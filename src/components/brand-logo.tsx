import Image from 'next/image'

type BrandLogoProps = {
  compact?: boolean
  mobileIconOnly?: boolean
  className?: string
}

export function BrandLogo({ compact = false, mobileIconOnly = false, className = '' }: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`${compact ? 'w-8 h-8 sm:w-9 sm:h-9' : 'w-10 h-10 sm:w-11 sm:h-11'} shrink-0 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-sm`}>
        <Image
          src="/logo.png"
          alt=""
          width={compact ? 36 : 44}
          height={compact ? 36 : 44}
          className="w-full h-full object-contain scale-125"
          priority
        />
      </span>
      <span className={`${mobileIconOnly ? 'hidden sm:inline' : ''} text-lg sm:text-headline-sm font-bold text-primary leading-none`}>IncluEdu</span>
    </span>
  )
}
