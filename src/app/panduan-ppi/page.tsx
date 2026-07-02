import { FileDown, CheckCircle2 } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { NavAuth } from '@/components/nav-auth'
import { CtaButton } from '@/components/cta-button'

export default function PanduanPpiPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <header className="app-header">
        <nav className="app-nav">
          <a href="/" aria-label="IncluEdu - Beranda"><BrandLogo compact mobileIconOnly /></a>
          <div className="hidden md:flex items-center gap-lg">
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="/#fitur">Fitur</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="/#tutorial">Tutorial</a>
            <a className="text-on-surface-variant hover:text-primary font-bold transition-colors font-label-md text-label-md" href="/panduan-ppi">Panduan PPI</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="/#tentang">Tentang</a>
          </div>
          <NavAuth />
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-28 pb-20">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold">Integrasi IncluEdu dengan PPI</h1>
          <p className="mt-3 text-on-surface-variant text-lg">
            Program Pembelajaran Individual sebagai acuan utama seluruh fitur
          </p>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border bg-white p-6">
            <h2 className="text-xl font-bold">Apa itu PPI?</h2>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              Program Pembelajaran Individual (PPI) adalah dokumen hukum yang wajib dimiliki setiap peserta didik berkebutuhan khusus di Indonesia. PPI memuat profil kemampuan, tujuan pembelajaran, strategi, layanan pendukung, dan metode evaluasi yang disesuaikan secara individual. PPI disusun oleh Tim PPI yang terdiri dari guru kelas, orang tua, kepala sekolah, dan tenaga ahli terkait.
            </p>
          </section>

          <section className="rounded-3xl border bg-white p-6">
            <h2 className="text-xl font-bold">Bagaimana IncluEdu Mengintegrasikan PPI?</h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              {[
                { title: 'Asesmen Awal', desc: 'Menentukan fase kemampuan aktual siswa sebagai dasar penyusunan PPI, bukan berdasarkan kelas administratif.' },
                { title: 'Identifikasi Kebutuhan', desc: 'Mencatat kategori hambatan, status diagnosis, dan kebutuhan dukungan untuk menyusun profil peserta didik.' },
                { title: 'Tim PPI', desc: 'Mendata anggota Tim PPI sesuai peran dan kewajiban sebagai dasar kolaborasi layanan.' },
                { title: 'Tujuan Pembelajaran', desc: 'Menyusun tujuan jangka panjang dan jangka pendek yang spesifik, terukur, dan dapat diamati.' },
                { title: 'Akomodasi & Strategi', desc: 'Mencatat strategi pembelajaran, media, alat bantu, dan penyesuaian yang diperlukan.' },
                { title: 'Penempatan & Layanan', desc: 'Menentukan pelaksana, frekuensi, durasi, dan metode evaluasi untuk setiap tujuan.' },
                { title: 'Tracking Perkembangan', desc: 'Mencatat kemajuan harian dengan level bantuan terstandar sebagai bukti perkembangan.' },
                { title: 'Evaluasi & Tindak Lanjut', desc: 'Mengevaluasi ketercapaian tujuan dan menentukan tindak lanjut: lanjut, remedial, atau pengayaan.' },
                { title: 'Rapor Naratif', desc: 'Menghasilkan laporan perkembangan yang komunikatif untuk orang tua, bukan sekadar angka.' },
                { title: 'Dokumen Kontrak', desc: 'Menyediakan dokumen PPI siap cetak yang memuat seluruh komponen untuk ditandatangani.' },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl bg-surface-container-low p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-primary" />
                    <div>
                      <div className="font-bold text-sm">{item.title}</div>
                      <div className="text-xs text-on-surface-variant mt-1">{item.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border bg-white p-6">
            <h2 className="text-xl font-bold">Unduh Panduan PPI</h2>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              Untuk memahami lebih lanjut tentang PPI dan bagaimana IncluEdu mendukung implementasinya, unduh dokumen panduan berikut:
            </p>
            <a
              href="/Panduan_PPI.pdf"
              target="_blank"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-white"
            >
              <FileDown className="w-5 h-5" />
              Unduh Panduan PPI (PDF)
            </a>
          </section>

          <div className="text-center">
            <CtaButton />
          </div>
        </div>
      </main>
    </div>
  )
}
