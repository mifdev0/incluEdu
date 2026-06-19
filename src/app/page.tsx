import { ClipboardList, Bot, FileText, ArrowRight, Check, Target, BookOpen, BarChart3 } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'

export default function Home() {
  return (
    <>
      {/* Floating Nav */}
      <header className="app-header">
        <nav className="app-nav">
          <a href="/" aria-label="IncluEdu - Beranda"><BrandLogo compact mobileIconOnly /></a>
          <div className="hidden md:flex items-center gap-lg">
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="#fitur">Fitur</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="#tentang">Tentang</a>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <a href="/login" className="px-3 sm:px-5 py-2.5 rounded-full font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">Masuk</a>
            <a href="/register" className="bg-primary hover:scale-105 active:scale-95 transition-all text-on-primary px-4 sm:px-gutter py-2.5 rounded-full font-label-md text-label-md shadow-sm inline-block whitespace-nowrap">
              <span className="sm:hidden">Daftar</span>
              <span className="hidden sm:inline">Mulai Gratis</span>
            </a>
          </div>
        </nav>
      </header>

      <main className="pt-[76px] sm:pt-32">
        {/* Hero */}
        <section className="relative max-w-container-max mx-auto px-4 sm:px-gutter text-center pt-7 pb-12 sm:py-xl overflow-visible">
          <div className="hidden sm:block absolute top-20 left-10 md:left-40 pointer-events-none opacity-60">
            <svg className="text-tertiary doodle-sparkle" fill="none" height="60" viewBox="0 0 24 24" width="60">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" />
            </svg>
          </div>
          <div className="absolute bottom-40 right-10 md:right-40 pointer-events-none opacity-40">
            <svg className="text-secondary/30" fill="none" height="60" viewBox="0 0 120 60" width="120">
              <path d="M10 50C30 20 60 20 90 50" stroke="currentColor" strokeDasharray="8 8" strokeLinecap="round" strokeWidth="4" />
            </svg>
          </div>

          <div className="inline-flex items-center gap-3 mb-4 sm:mb-md">
            <span className="w-8 h-px bg-primary" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.16em] text-primary">Program Pembelajaran Individual</span>
            <span className="w-8 h-px bg-primary" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="font-display text-[32px] leading-[1.12] sm:text-[40px] md:text-display-lg mb-4 sm:mb-gutter">
              Nilai Setiap Siswa dengan <br className="hidden sm:block" />
              <span className="relative inline-block">
                Cara yang Tepat
                <svg className="absolute -bottom-2 left-0 w-full" height="10" preserveAspectRatio="none" viewBox="0 0 300 10">
                  <path d="M0 5C50 2 150 2 300 8" fill="none" stroke="#732ee4" strokeLinecap="round" strokeWidth="4" />
                </svg>
              </span>
            </h1>
            <p className="text-[15px] leading-6 sm:text-body-lg text-on-surface-variant mb-6 sm:mb-lg max-w-2xl mx-auto">
              Susun tujuan belajar, catat perkembangan, dan evaluasi PPI setiap siswa dalam satu ruang kerja yang mudah dipahami guru.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-md">
              <a href="/register" className="w-full sm:w-auto bg-primary hover:scale-105 active:scale-95 transition-all text-on-primary px-lg py-4 rounded-full font-label-md text-label-md shadow-lg flex items-center justify-center gap-2">
                Mulai Gratis
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-container-max mx-auto px-4 sm:px-gutter py-12 sm:py-xl" id="fitur">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-lg items-start">
            <div className="lg:sticky lg:top-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-bold text-primary">01</span>
                <span className="h-px w-12 bg-primary/40" />
                <span className="text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant">Cara kerja</span>
              </div>
              <h2 className="font-display text-[32px] leading-tight md:text-display-lg text-on-surface mb-md">
                Satu alur sederhana untuk mendampingi setiap siswa.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
                IncluEdu membantu guru fokus pada hal yang penting: memahami kebutuhan, melihat kemajuan, dan menyampaikan perkembangan dengan bahasa yang manusiawi.
              </p>
            </div>

            <div className="relative space-y-md">
              <div className="hidden md:block absolute left-8 top-16 bottom-16 w-px bg-gradient-to-b from-primary via-secondary to-tertiary opacity-30" />
              {([
                {
                  step: "01",
                  title: "Amati dengan lebih terarah",
                  desc: "Pertanyaan observasi menyesuaikan kebutuhan belajar siswa, jadi guru tidak perlu menebak apa yang harus dicatat.",
                  detail: "Catatan singkat, relevan, dan dapat diisi setelah pembelajaran.",
                  bg: "bg-[#F3EAFF]",
                  color: "text-primary",
                  icon: ClipboardList,
                },
                {
                  step: "02",
                  title: "Temukan pola perkembangannya",
                  desc: "AI merangkum catatan menjadi pola yang mudah dibaca tanpa membandingkan siswa dengan teman sekelasnya.",
                  detail: "Lihat kekuatan, tantangan, dan langkah pendampingan berikutnya.",
                  bg: "bg-[#E4F8EE]",
                  color: "text-secondary",
                  icon: Bot,
                },
                {
                  step: "03",
                  title: "Ceritakan kemajuan dengan empati",
                  desc: "Susun rapor naratif yang jelas bagi orang tua, tetap personal, dan berfokus pada perkembangan anak.",
                  detail: "Draf siap ditinjau guru sebelum dibagikan.",
                  bg: "bg-[#FFF5CF]",
                  color: "text-tertiary",
                  icon: FileText,
                },
              ] as const).map((item) => (
                <article key={item.step} className={`${item.bg} relative rounded-[1.5rem] sm:rounded-[2rem] border border-white/70 p-5 md:p-lg overflow-hidden group transition-transform duration-300 hover:-translate-y-1`}>
                  <div className="absolute -right-10 -top-12 w-40 h-40 rounded-full bg-white/40" />
                  <div className="relative flex flex-col md:flex-row gap-4 md:gap-md">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-2xl bg-white/80 ${item.color} flex items-center justify-center shadow-sm`}>
                      <item.icon className="w-7 h-7" strokeWidth={1.8} />
                    </div>
                    <div className="flex-1">
                      <span className={`font-label-sm text-label-sm ${item.color}`}>LANGKAH {item.step}</span>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1 mb-2">{item.title}</h3>
                      <p className="text-on-surface-variant font-body-md text-body-md mb-3">{item.desc}</p>
                      <div className="flex items-start gap-2 text-sm font-semibold text-on-surface">
                        <Check className={`w-4 h-4 mt-0.5 shrink-0 ${item.color}`} strokeWidth={3} />
                        {item.detail}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Product workflow */}
        <section className="bg-[#241A36] py-14 sm:py-xl text-white" id="tentang">
          <div className="max-w-container-max mx-auto px-4 sm:px-gutter">
            <div className="grid lg:grid-cols-[0.7fr_1.3fr] gap-8 lg:gap-lg">
              <div>
                <span className="text-sm font-bold uppercase tracking-[0.14em] text-primary-fixed-dim">Yang dikelola di IncluEdu</span>
                <h2 className="font-display text-[30px] leading-tight sm:text-display-lg-mobile mt-3">
                  Bukan sekadar mencatat. Setiap data punya tujuan.
                </h2>
                <p className="mt-4 text-white/65 leading-relaxed max-w-md">
                  Setiap bagian saling terhubung dari perencanaan PPI sampai laporan yang dapat dibaca orang tua.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  {
                    number: "01",
                    title: "Rancang PPI",
                    action: "Guru menentukan kemampuan awal dan tujuan individual.",
                    result: "Tersimpan sebagai target belajar yang terukur.",
                    icon: Target,
                    accent: "bg-[#8B5CF6]",
                  },
                  {
                    number: "02",
                    title: "Terapkan strategi",
                    action: "Guru memilih adaptasi dan cara mengajar yang sesuai.",
                    result: "Tim memiliki panduan pendampingan yang sama.",
                    icon: BookOpen,
                    accent: "bg-[#0F9F76]",
                  },
                  {
                    number: "03",
                    title: "Pantau kemajuan",
                    action: "Guru mengisi observasi singkat setelah pembelajaran.",
                    result: "Perubahan tiap tujuan terlihat dalam grafik.",
                    icon: BarChart3,
                    accent: "bg-[#D99B16]",
                  },
                  {
                    number: "04",
                    title: "Evaluasi dan laporkan",
                    action: "Data observasi dianalisis dan ditinjau oleh guru.",
                    result: "Tersusun evaluasi PPI dan narasi untuk orang tua.",
                    icon: FileText,
                    accent: "bg-[#D65B73]",
                  },
                ].map((item) => (
                  <article key={item.number} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-2xl ${item.accent} flex items-center justify-center`}>
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-bold text-white/35">{item.number}</span>
                    </div>
                    <h3 className="text-xl font-bold mt-5">{item.title}</h3>
                    <div className="mt-4 space-y-3 text-sm leading-relaxed">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-white/40">Yang dilakukan guru</div>
                        <p className="mt-1 text-white/75">{item.action}</p>
                      </div>
                      <div className="border-t border-white/10 pt-3">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-white/40">Hasilnya</div>
                        <p className="mt-1 text-white">{item.result}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full rounded-t-xl bg-surface-container mt-xl">
        <div className="max-w-container-max mx-auto px-gutter py-xl flex flex-col md:flex-row justify-between gap-md">
          <div className="max-w-sm">
            <a href="/" aria-label="IncluEdu - Beranda"><BrandLogo className="mb-sm" /></a>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Memberdayakan setiap guru, mendukung setiap siswa. Solusi cerdas untuk pendidikan inklusif masa depan.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-lg">
            <div className="flex flex-col gap-sm">
              <h4 className="font-label-md text-label-md font-bold text-on-surface">Navigasi</h4>
              <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#fitur">Fitur</a>
              <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#tentang">Tentang</a>
            </div>
            <div className="flex flex-col gap-sm">
              <h4 className="font-label-md text-label-md font-bold text-on-surface">Legal</h4>
              <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Kebijakan Privasi</a>
              <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Syarat & Ketentuan</a>
            </div>
          </div>
        </div>
        <div className="max-w-container-max mx-auto px-gutter py-md border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center text-center gap-sm">
          <p className="font-body-md text-body-md text-on-surface-variant opacity-70">
            © 2026 IncluEdu Indonesia. Memberdayakan setiap guru, mendukung setiap siswa.
          </p>
        </div>
      </footer>
    </>
  )
}
