import { ClipboardList, Bot, FileText, ArrowRight, Check, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <>
      {/* Floating Nav */}
      <header className="z-50 fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-container-max rounded-full border border-outline-variant/20 bg-surface/80 backdrop-blur-md shadow-sm">
        <nav className="flex justify-between items-center px-sm md:px-lg py-sm w-full">
          <div className="font-headline-sm text-headline-sm font-bold text-primary">IncluEdu</div>
          <div className="hidden md:flex items-center gap-lg">
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="#fitur">Fitur</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="#tentang">Tentang</a>
          </div>
          <div className="flex gap-3">
            <a href="/login" className="px-5 py-2 rounded-full font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">Masuk</a>
            <a href="/register" className="bg-primary hover:scale-105 active:scale-95 transition-all text-on-primary px-gutter py-2 rounded-full font-label-md text-label-md shadow-sm inline-block">
              Mulai Gratis
            </a>
          </div>
        </nav>
      </header>

      <main className="pt-32">
        {/* Hero */}
        <section className="relative max-w-container-max mx-auto px-gutter text-center py-xl overflow-visible">
          <div className="absolute top-20 left-10 md:left-40 pointer-events-none opacity-60">
            <svg className="text-tertiary doodle-sparkle" fill="none" height="60" viewBox="0 0 24 24" width="60">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" />
            </svg>
          </div>
          <div className="absolute bottom-40 right-10 md:right-40 pointer-events-none opacity-40">
            <svg className="text-secondary/30" fill="none" height="60" viewBox="0 0 120 60" width="120">
              <path d="M10 50C30 20 60 20 90 50" stroke="currentColor" strokeDasharray="8 8" strokeLinecap="round" strokeWidth="4" />
            </svg>
          </div>

          {/* Social Proof */}
          <div className="inline-flex items-center gap-sm bg-surface-container-highest/50 backdrop-blur-sm px-4 py-2 rounded-full border border-outline-variant/30 mb-md">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-surface bg-pastel-purple" />
              ))}
            </div>
            <span className="font-label-md text-label-md text-on-surface-variant">
              <span className="text-primary font-bold">500+</span> Guru sudah bergabung
            </span>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="font-display text-display-lg-mobile md:text-display-lg mb-gutter leading-tight">
              Nilai Setiap Siswa dengan <br />
              <span className="relative inline-block">
                Cara yang Tepat
                <svg className="absolute -bottom-2 left-0 w-full" height="10" preserveAspectRatio="none" viewBox="0 0 300 10">
                  <path d="M0 5C50 2 150 2 300 8" fill="none" stroke="#732ee4" strokeLinecap="round" strokeWidth="4" />
                </svg>
              </span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg max-w-2xl mx-auto">
              Platform penilaian inklusif berbasis AI yang membantu guru menilai siswa berkebutuhan khusus secara adil dan efisien.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-md">
              <a href="/register" className="bg-primary hover:scale-105 active:scale-95 transition-all text-on-primary px-lg py-4 rounded-full font-label-md text-label-md shadow-lg flex items-center gap-2">
                Mulai Gratis
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-container-max mx-auto px-gutter py-xl" id="fitur">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-lg items-start">
            <div className="lg:sticky lg:top-32">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary font-label-md text-label-md mb-md">
                <Sparkles className="w-4 h-4" />
                Dari catatan menjadi pemahaman
              </div>
              <h2 className="font-display text-display-lg-mobile md:text-display-lg text-on-surface mb-md">
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
                <article key={item.step} className={`${item.bg} relative rounded-[2rem] border border-white/70 p-md md:p-lg overflow-hidden group transition-transform duration-300 hover:-translate-y-1`}>
                  <div className="absolute -right-10 -top-12 w-40 h-40 rounded-full bg-white/40" />
                  <div className="relative flex flex-col md:flex-row gap-md">
                    <div className={`w-16 h-16 shrink-0 rounded-2xl bg-white/80 ${item.color} flex items-center justify-center shadow-sm`}>
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

        {/* Stats */}
        <section className="bg-surface-container py-xl" id="tentang">
          <div className="max-w-container-max mx-auto px-gutter grid grid-cols-2 md:grid-cols-4 gap-lg text-center">
            {[
              { num: "12k+", label: "Siswa Terbantu" },
              { num: "45+", label: "Kota di Indonesia" },
              { num: "98%", label: "Guru Puas" },
              { num: "15m+", label: "Hemat Waktu/Hari" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-display-lg-mobile text-primary font-bold">{s.num}</div>
                <div className="font-label-md text-label-md text-on-surface-variant">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full rounded-t-xl bg-surface-container mt-xl">
        <div className="max-w-container-max mx-auto px-gutter py-xl flex flex-col md:flex-row justify-between gap-md">
          <div className="max-w-sm">
            <div className="font-headline-sm text-headline-sm font-bold text-primary mb-sm">IncluEdu</div>
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
