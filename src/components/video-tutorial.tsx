'use client'

import { useState } from 'react'
import { ChevronDown, Play } from 'lucide-react'

const tutorials = [
  {
    id: 1,
    title: 'Cara Membuat Akun IncluEdu',
    url: 'https://www.youtube.com/embed/m5e7fH8mFDA',
    available: true,
  },
  { id: 2, title: 'Cara Membuat Kelas & Menambahkan Siswa', url: '', available: false },
  { id: 3, title: 'Cara Melakukan Asesmen Adaptif', url: '', available: false },
  { id: 4, title: 'Cara Menyusun PPI dengan AI', url: '', available: false },
  { id: 5, title: 'Cara Tracking Harian', url: '', available: false },
  { id: 6, title: 'Cara Membaca Grafik Perkembangan', url: '', available: false },
  { id: 7, title: 'Cara Membuat Rapor Evaluasi', url: '', available: false },
]

export function VideoTutorial() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-14 sm:py-xl bg-white">
      <div className="max-w-container-max mx-auto px-4 sm:px-gutter">
        <div className="max-w-xl mx-auto text-center">
          <span className="text-[10px] sm:text-sm font-bold uppercase tracking-[0.14em] text-primary">PANDUAN VIDEO</span>
          <h2 className="font-display text-[25px] leading-[1.18] sm:text-display-lg-mobile mt-2 sm:mt-3">
            Tutorial Penggunaan IncluEdu
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-body-md text-on-surface-variant leading-6 sm:leading-relaxed">
            Tonton video panduan berikut untuk mempelajari fitur-fitur IncluEdu langkah demi langkah.
          </p>
        </div>

        <div className="mt-8 sm:mt-10 max-w-2xl mx-auto space-y-3">
          {tutorials.map((item) => (
            <div key={item.id} className="rounded-2xl border border-outline-variant/20 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(open === item.id ? null : item.id)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-surface-container-low transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.available ? (
                    <Play className="w-5 h-5 shrink-0 text-primary" />
                  ) : (
                    <div className="w-5 h-5 shrink-0 rounded-full border-2 border-outline-variant/40" />
                  )}
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-on-surface">{item.title}</span>
                    {!item.available && <span className="ml-2 text-[11px] text-on-surface-variant">— Segera hadir</span>}
                  </div>
                </div>
                {item.available && (
                  <ChevronDown className={`w-4 h-4 shrink-0 text-on-surface-variant transition-transform ${open === item.id ? '' : '-rotate-90'}`} />
                )}
              </button>
              {item.available && open === item.id && (
                <div className="px-5 pb-5">
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={item.url}
                      title={item.title}
                      className="absolute inset-0 w-full h-full rounded-2xl"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
