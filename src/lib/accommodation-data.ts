export type AccommodationOption = {
  value: string
  group: 'Penyampaian materi' | 'Waktu dan tugas' | 'Lingkungan belajar' | 'Cara menjawab' | 'Alat bantu' | 'Sosial dan emosi'
  when: string
  categories: string[]
}

export const ACCOMMODATION_OPTIONS: AccommodationOption[] = [
  { value: 'Instruksi singkat dan bertahap', group: 'Penyampaian materi', when: 'Pilih jika siswa kesulitan mengikuti instruksi panjang atau beberapa perintah sekaligus.', categories: ['slow_learner', 'adhd', 'autisme', 'hambatan_intelektual', 'hambatan_komunikasi'] },
  { value: 'Instruksi diulang atau disederhanakan', group: 'Penyampaian materi', when: 'Pilih jika siswa memahami materi setelah penjelasan diulang dengan bahasa yang lebih sederhana.', categories: ['slow_learner', 'disleksia', 'hambatan_intelektual', 'hambatan_komunikasi'] },
  { value: 'Dukungan gambar, simbol, atau video', group: 'Penyampaian materi', when: 'Pilih jika siswa lebih mudah memahami informasi melalui contoh visual.', categories: ['autisme', 'tunarungu', 'hambatan_komunikasi', 'slow_learner'] },
  { value: 'Materi berukuran besar dan kontras tinggi', group: 'Penyampaian materi', when: 'Pilih jika siswa kesulitan melihat tulisan kecil atau objek dengan warna yang kurang kontras.', categories: ['tunanetra'] },
  { value: 'Braille atau media taktil', group: 'Penyampaian materi', when: 'Pilih jika siswa menggunakan braille atau perlu meraba bentuk untuk memahami materi.', categories: ['tunanetra'] },
  { value: 'Guru menghadap siswa ketika berbicara', group: 'Penyampaian materi', when: 'Pilih jika siswa perlu membaca gerak bibir, ekspresi, atau isyarat visual guru.', categories: ['tunarungu', 'hambatan_komunikasi'] },
  { value: 'Waktu pengerjaan tambahan', group: 'Waktu dan tugas', when: 'Pilih jika siswa memahami tugas tetapi membutuhkan waktu lebih lama untuk menyelesaikannya.', categories: ['slow_learner', 'disleksia', 'hambatan_intelektual', 'hambatan_motorik'] },
  { value: 'Tugas dibagi menjadi bagian kecil', group: 'Waktu dan tugas', when: 'Pilih jika siswa kewalahan menghadapi tugas panjang atau sering berhenti sebelum selesai.', categories: ['adhd', 'autisme', 'slow_learner', 'hambatan_intelektual'] },
  { value: 'Jumlah soal dikurangi tanpa mengubah kompetensi', group: 'Waktu dan tugas', when: 'Pilih jika kelelahan atau hambatan motorik membuat banyak soal tidak mencerminkan pemahaman siswa.', categories: ['hambatan_motorik', 'disleksia', 'slow_learner'] },
  { value: 'Jeda belajar terjadwal', group: 'Waktu dan tugas', when: 'Pilih jika fokus atau kondisi emosi menurun setelah belajar dalam durasi tertentu.', categories: ['adhd', 'autisme', 'hambatan_motorik'] },
  { value: 'Posisi duduk minim distraksi', group: 'Lingkungan belajar', when: 'Pilih jika siswa mudah teralihkan oleh suara, teman, pintu, atau jendela.', categories: ['adhd', 'autisme', 'slow_learner'] },
  { value: 'Posisi dekat guru atau papan', group: 'Lingkungan belajar', when: 'Pilih jika siswa perlu arahan lebih cepat atau akses visual dan auditori yang lebih jelas.', categories: ['tunanetra', 'tunarungu', 'slow_learner', 'adhd'] },
  { value: 'Pencahayaan disesuaikan', group: 'Lingkungan belajar', when: 'Pilih jika pencahayaan memengaruhi kemampuan melihat materi atau kenyamanan sensorik.', categories: ['tunanetra', 'autisme'] },
  { value: 'Ruang tenang ketika kewalahan', group: 'Lingkungan belajar', when: 'Pilih jika siswa mudah mengalami kelebihan rangsangan, cemas, atau sulit menenangkan diri.', categories: ['autisme', 'adhd'] },
  { value: 'Jalur kelas aman dan mudah diakses', group: 'Lingkungan belajar', when: 'Pilih jika siswa memiliki hambatan penglihatan atau mobilitas.', categories: ['tunanetra', 'hambatan_motorik'] },
  { value: 'Jawaban lisan sebagai alternatif tulisan', group: 'Cara menjawab', when: 'Pilih jika siswa memahami materi tetapi kesulitan menuangkan jawaban secara tertulis.', categories: ['disleksia', 'hambatan_motorik', 'hambatan_komunikasi'] },
  { value: 'Demonstrasi praktik sebagai alternatif tes tertulis', group: 'Cara menjawab', when: 'Pilih jika kemampuan siswa lebih terlihat melalui praktik daripada soal tertulis.', categories: ['disleksia', 'hambatan_intelektual', 'hambatan_motorik'] },
  { value: 'Waktu berpikir sebelum menjawab', group: 'Cara menjawab', when: 'Pilih jika siswa memerlukan jeda untuk memproses pertanyaan sebelum merespons.', categories: ['slow_learner', 'autisme', 'hambatan_komunikasi'] },
  { value: 'Menunjuk gambar atau simbol untuk menjawab', group: 'Cara menjawab', when: 'Pilih jika komunikasi verbal siswa terbatas tetapi mampu memilih gambar atau simbol.', categories: ['hambatan_komunikasi', 'autisme', 'tunarungu'] },
  { value: 'Alat bantu dengar atau dukungan visual', group: 'Alat bantu', when: 'Pilih jika siswa mengalami hambatan pendengaran atau membutuhkan informasi visual pendamping.', categories: ['tunarungu'] },
  { value: 'Screen reader atau alat pembesar', group: 'Alat bantu', when: 'Pilih jika siswa menggunakan perangkat pembaca layar atau pembesar untuk mengakses materi.', categories: ['tunanetra'] },
  { value: 'Pensil adaptif atau papan miring', group: 'Alat bantu', when: 'Pilih jika siswa kesulitan menggenggam alat tulis atau menjaga posisi tangan.', categories: ['hambatan_motorik'] },
  { value: 'Timer visual', group: 'Alat bantu', when: 'Pilih jika siswa perlu melihat sisa waktu agar dapat mulai dan menyelesaikan kegiatan.', categories: ['adhd', 'autisme'] },
  { value: 'Jadwal visual atau kartu komunikasi', group: 'Alat bantu', when: 'Pilih jika siswa terbantu oleh urutan kegiatan dan pilihan komunikasi yang terlihat.', categories: ['autisme', 'hambatan_komunikasi', 'tunarungu'] },
  { value: 'Rutinitas yang konsisten', group: 'Sosial dan emosi', when: 'Pilih jika perubahan mendadak membuat siswa cemas, menolak, atau kehilangan fokus.', categories: ['autisme', 'adhd'] },
  { value: 'Pemberitahuan sebelum perubahan kegiatan', group: 'Sosial dan emosi', when: 'Pilih jika siswa membutuhkan persiapan sebelum berpindah kegiatan atau jadwal.', categories: ['autisme', 'adhd'] },
  { value: 'Penguatan positif yang spesifik', group: 'Sosial dan emosi', when: 'Pilih jika pujian yang jelas membantu siswa mengulangi perilaku atau strategi belajar yang tepat.', categories: ['adhd', 'slow_learner', 'hambatan_intelektual', 'autisme'] },
  { value: 'Teman pendamping atau peer buddy', group: 'Sosial dan emosi', when: 'Pilih jika siswa membutuhkan contoh dan dukungan teman untuk mengikuti kegiatan sosial atau kelas.', categories: ['autisme', 'tunanetra', 'tunarungu', 'hambatan_motorik'] },
]

export const ACCOMMODATION_GROUPS = [
  'Penyampaian materi',
  'Waktu dan tugas',
  'Lingkungan belajar',
  'Cara menjawab',
  'Alat bantu',
  'Sosial dan emosi',
] as const

export function recommendedAccommodations(category: string) {
  const matched = ACCOMMODATION_OPTIONS.filter((option) => option.categories.includes(category))
  return (matched.length > 0 ? matched : ACCOMMODATION_OPTIONS.filter((option) =>
    ['Instruksi singkat dan bertahap', 'Waktu pengerjaan tambahan', 'Penguatan positif yang spesifik'].includes(option.value)
  )).slice(0, 6)
}
