import { ClipboardList, FileText, ArrowRight, Check, Target, BarChart3, ChevronRight, UsersRound, FileSignature, GraduationCap } from 'lucide-react'
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
              <span className="hidden sm:inline">Daftar</span>
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
            <span className="text-[10px] sm:text-sm font-bold uppercase tracking-[0.14em] text-primary">Program Pembelajaran Individual</span>
            <span className="w-8 h-px bg-primary" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="font-display text-[28px] leading-[1.14] sm:text-[40px] md:text-display-lg mb-3 sm:mb-gutter">
              Nilai Setiap Siswa dengan <br className="hidden sm:block" />
              <span className="relative inline-block">
                Cara yang Tepat
                <svg className="absolute -bottom-2 left-0 w-full" height="10" preserveAspectRatio="none" viewBox="0 0 300 10">
                  <path d="M0 5C50 2 150 2 300 8" fill="none" stroke="#732ee4" strokeLinecap="round" strokeWidth="4" />
                </svg>
              </span>
            </h1>
            <p className="text-sm leading-[1.55] sm:text-body-lg text-on-surface-variant mb-5 sm:mb-lg max-w-2xl mx-auto">
              Bantu guru menyusun, menyepakati, menjalankan, dan mengevaluasi Program Pembelajaran Individual berdasarkan kemampuan nyata setiap siswa.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-md">
              <a href="/register" className="w-full sm:w-auto bg-primary hover:scale-105 active:scale-95 transition-all text-on-primary px-6 sm:px-lg py-3.5 sm:py-4 rounded-full text-sm font-bold shadow-lg flex items-center justify-center gap-2">
                Coba Sekarang
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
                <span className="h-px w-12 bg-primary" />
                <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant">Cara kerja</span>
              </div>
              <h2 className="font-display text-[26px] leading-[1.18] sm:text-[34px] md:text-display-lg text-on-surface mb-3 sm:mb-md">
                Satu alur sederhana untuk mendampingi setiap siswa.
              </h2>
              <p className="text-sm leading-6 sm:text-body-lg text-on-surface-variant max-w-lg">
                Dari asesmen awal sampai laporan akhir, setiap data tersambung dalam satu alur PPI yang dapat ditinjau guru dan Tim PPI.
              </p>
            </div>

            <div className="relative space-y-md">
              <div className="hidden md:block absolute left-8 top-16 bottom-16 w-px bg-gradient-to-b from-primary via-secondary to-tertiary opacity-30" />
              {([
                {
                  step: "01",
                  title: "Kenali siswa dan bentuk Tim PPI",
                  desc: "Guru mencatat kebutuhan siswa, memilih kelas, dan melibatkan guru kelas, kepala sekolah, serta orang tua sejak awal.",
                  detail: "AI dapat memberi indikasi awal bila kategori kebutuhan masih diragukan, tanpa menggantikan diagnosis tenaga ahli.",
                  bg: "bg-[#F3EAFF]",
                  color: "text-primary",
                  icon: UsersRound,
                },
                {
                  step: "02",
                  title: "Temukan fase kemampuan aktual",
                  desc: "Asesmen membaca, menulis, matematika, sikap belajar, sosial-emosional, bina diri, dan motorik disesuaikan dengan tingkat kelas.",
                  detail: "Sistem merekomendasikan adaptasi Fase A–F berdasarkan kemampuan yang benar-benar diamati.",
                  bg: "bg-[#E4F8EE]",
                  color: "text-secondary",
                  icon: ClipboardList,
                },
                {
                  step: "03",
                  title: "Susun target dari Capaian Pembelajaran",
                  desc: "Guru memilih CP lintas fase lalu menyusun tujuan akademik dan non-akademik yang spesifik, terukur, dan dapat diamati.",
                  detail: "AI menyiapkan draf tujuan, strategi, aktivitas, dan analisis tugas untuk ditinjau guru.",
                  bg: "bg-[#FFF5CF]",
                  color: "text-tertiary",
                  icon: Target,
                },
                {
                  step: "04",
                  title: "Sepakati kontrak layanan PPI",
                  desc: "Rancangan PPI dirangkum menjadi dokumen tertulis untuk dibaca Tim PPI dan disetujui orang tua sebelum pelaksanaan.",
                  detail: "Dokumen memuat asesmen, target, layanan, pelaksana, evaluasi, dan ruang tanda tangan.",
                  bg: "bg-[#FCE8EC]",
                  color: "text-[#B23A57]",
                  icon: FileSignature,
                },
                {
                  step: "05",
                  title: "Tracking, evaluasi, dan laporkan",
                  desc: "Guru mencatat tingkat bantuan per langkah dan hasil target utama dalam sesi Tracking 1, 2, 3, dan seterusnya.",
                  detail: "Sistem menyusun ketercapaian, rekomendasi nilai, grafik, dan narasi yang tetap harus ditinjau guru.",
                  bg: "bg-[#E7F2FF]",
                  color: "text-[#2768A8]",
                  icon: BarChart3,
                },
              ] as const).map((item) => (
                <article key={item.step} className={`${item.bg} relative rounded-[1.5rem] sm:rounded-[2rem] border border-white/70 p-5 md:p-lg overflow-hidden group transition-transform duration-300 hover:-translate-y-1`}>
                  <div className="absolute -right-10 -top-12 w-40 h-40 rounded-full bg-white/40" />
                  <div className="relative flex flex-col md:flex-row gap-4 md:gap-md">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-2xl bg-white/80 ${item.color} flex items-center justify-center shadow-sm`}>
                      <item.icon className="w-7 h-7" strokeWidth={1.8} />
                    </div>
                    <div className="flex-1">
                      <span className={`text-[10px] sm:text-label-sm font-bold tracking-wide ${item.color}`}>LANGKAH {item.step}</span>
                      <h3 className="text-lg sm:text-headline-sm font-bold text-on-surface mt-1 mb-2">{item.title}</h3>
                      <p className="text-on-surface-variant text-sm leading-6 sm:text-body-md mb-3">{item.desc}</p>
                      <div className="flex items-start gap-2 text-xs sm:text-sm font-semibold text-on-surface">
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
            <div className="max-w-2xl">
              <span className="text-[10px] sm:text-sm font-bold uppercase tracking-[0.14em] text-primary-fixed-dim">Yang dihasilkan IncluEdu</span>
              <h2 className="font-display text-[25px] leading-[1.18] sm:text-display-lg-mobile mt-2 sm:mt-3">
                Bukan sekadar catatan, tetapi program yang dapat dijalankan dan dipertanggungjawabkan.
              </h2>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/65 leading-6 sm:leading-relaxed">
                Setiap keluaran berasal dari asesmen dan target individual siswa. AI membantu menyusun draf, sedangkan keputusan tetap berada pada guru dan Tim PPI.
              </p>
            </div>

            <div className="mt-8 sm:mt-10 rounded-[2rem] border border-white/10 bg-white/[0.05] p-3 sm:p-4">
              <div className="grid lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-stretch">
                {[
                  {
                    number: "01",
                    title: "Profil dan adaptasi CP",
                    desc: "Ringkasan kekuatan, kebutuhan dukungan, dan fase kemampuan untuk setiap area akademik.",
                    icon: GraduationCap,
                    accent: "bg-[#8B5CF6]",
                  },
                  {
                    number: "02",
                    title: "Dokumen PPI",
                    desc: "Kontrak layanan siap cetak yang memuat tujuan, strategi, Tim PPI, dan persetujuan orang tua.",
                    icon: FileSignature,
                    accent: "bg-[#0F9F76]",
                  },
                  {
                    number: "03",
                    title: "Bukti perkembangan",
                    desc: "Tracking per sesi, tingkat bantuan, hasil tugas utama, dan ketercapaian setiap target.",
                    icon: BarChart3,
                    accent: "bg-[#D99B16]",
                  },
                  {
                    number: "04",
                    title: "Evaluasi dan laporan",
                    desc: "Rekomendasi nilai akademik, capaian non-akademik, tindak lanjut, dan narasi untuk orang tua.",
                    icon: FileText,
                    accent: "bg-[#D65B73]",
                  },
                ].map((item, index, items) => (
                  <div key={item.number} className="contents">
                    <article className="min-h-[170px] sm:min-h-[210px] rounded-3xl p-4 sm:p-6 flex flex-col justify-between hover:bg-white/[0.05] transition-colors">
                      <div className="flex items-center justify-between">
                        <div className={`w-11 h-11 rounded-2xl ${item.accent} flex items-center justify-center`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-white/30">{item.number}</span>
                      </div>
                      <div className="mt-5 sm:mt-8">
                        <h3 className="text-base sm:text-lg font-bold">{item.title}</h3>
                        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-white/60">{item.desc}</p>
                      </div>
                    </article>
                    {index < items.length - 1 && (
                      <div className="hidden lg:flex items-center justify-center text-white/20">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    )}
                    {index < items.length - 1 && <div className="lg:hidden h-px bg-white/10 mx-5" />}
                  </div>
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
            <p className="text-sm sm:text-body-md text-on-surface-variant">
              Ruang kerja digital untuk menyusun, menyepakati, melaksanakan, dan mengevaluasi PPI siswa berkebutuhan khusus.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-lg">
            <div className="flex flex-col gap-sm">
              <h4 className="text-sm font-bold text-on-surface">Navigasi</h4>
              <a className="text-sm sm:text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#fitur">Fitur</a>
              <a className="text-sm sm:text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#tentang">Tentang</a>
            </div>
            <div className="flex flex-col gap-sm">
              <h4 className="text-sm font-bold text-on-surface">Legal</h4>
              <a className="text-sm sm:text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Kebijakan Privasi</a>
              <a className="text-sm sm:text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Syarat & Ketentuan</a>
            </div>
          </div>
        </div>
        <div className="max-w-container-max mx-auto px-gutter py-md border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center text-center gap-sm">
          <p className="text-xs sm:text-body-md text-on-surface-variant opacity-70">
            © 2026 IncluEdu Indonesia. Memberdayakan setiap guru, mendukung setiap siswa.
          </p>
        </div>
      </footer>
    </>
  )
}
