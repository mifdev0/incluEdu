export const PANDUAN_ABK: Record<string, {
  judul: string
  deskripsi: string
  adaptasi_mengajar: string[]
  tips_observasi: string[]
}> = {
  slow_learner: {
    judul: 'Panduan Mengajar Siswa Slow Learner',
    deskripsi: 'Siswa slow learner bukan siswa yang malas atau tidak mau belajar. Mereka membutuhkan waktu lebih lama untuk memproses informasi. Dengan strategi yang tepat, mereka bisa berkembang secara signifikan.',
    adaptasi_mengajar: [
      'Pecah instruksi menjadi langkah-langkah kecil yang jelas',
      'Ulangi penjelasan dengan cara berbeda jika siswa belum paham',
      'Berikan waktu ekstra untuk menyelesaikan tugas',
      'Gunakan visual aid (gambar, diagram) untuk memperjelas konsep',
      'Dudukkan siswa di baris depan agar mudah dimonitor',
      'Berikan pujian spesifik untuk kemajuan sekecil apapun',
    ],
    tips_observasi: [
      'Amati SETELAH adaptasi diterapkan minimal 1 minggu',
      'Bandingkan kemampuan siswa minggu ini vs minggu lalu — bukan vs siswa lain',
      'Catat apakah pengulangan efektif atau tidak',
      'Perhatikan momen di mana siswa berhasil — itu data penting',
    ],
  },
  disleksia: {
    judul: 'Panduan Mengajar Siswa Disleksia',
    deskripsi: 'Siswa disleksia bukan lambat atau malas. Otaknya memproses simbol tulisan secara berbeda. Mereka sering sangat cerdas secara verbal dan kreatif — hanya butuh pendekatan berbeda dalam literasi.',
    adaptasi_mengajar: [
      'Prioritaskan penjelasan lisan dibanding tulisan di papan',
      'Izinkan siswa menjawab secara verbal, tidak harus tertulis',
      'Berikan teks dengan font lebih besar dan spasi lebih lebar',
      'Jangan minta siswa membaca keras di depan kelas',
      'Berikan waktu ekstra untuk soal yang melibatkan membaca/menulis',
      'Gunakan warna/highlight untuk poin penting',
      'Bolehkan penggunaan recorder untuk mencatat materi',
    ],
    tips_observasi: [
      'Pisahkan kemampuan lisan dan tulisan dalam observasi',
      'Perhatikan apakah siswa mengembangkan strategi kompensasinya sendiri',
      'Jangan nilai dari tulisan saja — uji juga secara verbal',
      'Amati SETELAH adaptasi diterapkan minimal 2 minggu',
    ],
  },
  adhd: {
    judul: 'Panduan Mengajar Siswa ADHD',
    deskripsi: 'Siswa ADHD bukan siswa nakal atau tidak sopan. Mereka kesulitan mengatur perhatian dan impuls karena kondisi neurologis. Struktur dan rutinitas yang jelas adalah kunci utama.',
    adaptasi_mengajar: [
      'Buat jadwal kelas yang konsisten dan tempel di tempat yang terlihat siswa',
      'Beri tahu siswa sebelum ada perubahan jadwal',
      'Pecah sesi belajar menjadi blok pendek (10-15 menit) dengan jeda',
      'Berikan tugas dalam potongan kecil, satu per satu',
      'Dudukkan siswa jauh dari sumber distraksi (pintu, jendela)',
      'Gunakan timer visual saat mengerjakan tugas',
      'Berikan "tugas bergerak" (distribusi buku, dll) sebagai outlet energi',
    ],
    tips_observasi: [
      'Catat berapa lama siswa bisa fokus sebelum teralihkan',
      'Perhatikan apakah ada pemicu spesifik ketika fokus hilang',
      'Amati perbedaan saat ada struktur jelas vs tidak',
      'Amati SETELAH adaptasi diterapkan minimal 1 minggu',
    ],
  },
  autisme: {
    judul: 'Panduan Mengajar Siswa Autisme Ringan',
    deskripsi: 'Siswa dengan autisme ringan seringkali sangat detail-oriented dan memiliki minat mendalam di bidang tertentu. Komunikasi yang langsung, konsisten, dan prediktabel sangat membantu mereka.',
    adaptasi_mengajar: [
      'Gunakan bahasa yang langsung dan literal — hindari kiasan',
      'Beri tahu perubahan jadwal jauh-jauh hari',
      'Sediakan ruang/waktu tenang jika siswa overwhelmed',
      'Manfaatkan minat khusus siswa untuk mengaitkan materi',
      'Berikan instruksi tertulis selain lisan',
      'Konsisten dalam rutinitas dan ekspektasi',
    ],
    tips_observasi: [
      'Catat pemicu yang menyebabkan siswa overwhelmed',
      'Perhatikan kemajuan komunikasi verbal dari minggu ke minggu',
      'Catat apakah ada minat khusus yang bisa dimanfaatkan',
    ],
  },
  sensorik: {
    judul: 'Panduan Mengajar Siswa dengan Disabilitas Sensorik',
    deskripsi: 'Siswa dengan gangguan pendengaran atau penglihatan membutuhkan adaptasi lingkungan dan metode penyampaian materi. Pastikan alat bantu berfungsi dan posisi duduk optimal.',
    adaptasi_mengajar: [
      'Pastikan siswa duduk di posisi optimal (depan, dekat papan)',
      'Pastikan alat bantu (hearing aid, kacamata) berfungsi setiap hari',
      'Gunakan materi visual yang kontras dan berukuran besar',
      'Berbicara menghadap siswa agar bisa membaca gerak bibir',
      'Koordinasikan dengan orang tua jika alat bantu bermasalah',
    ],
    tips_observasi: [
      'Catat kondisi alat bantu setiap sesi observasi',
      'Perhatikan apakah lingkungan kelas mendukung (pencahayaan, noise)',
      'Bedakan antara kendala sensorik dan kendala pemahaman',
    ],
  },
  lainnya: {
    judul: 'Panduan Umum ABK',
    deskripsi: 'Setiap siswa berkebutuhan khusus adalah individu yang unik. Observasi yang sabar dan konsisten akan membantu guru memahami kebutuhan spesifik siswa ini.',
    adaptasi_mengajar: [
      'Mulai dengan observasi netral selama 1 minggu tanpa intervensi besar',
      'Identifikasi kekuatan siswa dan bangun dari sana',
      'Komunikasikan dengan orang tua tentang kondisi siswa di rumah',
      'Konsultasikan dengan guru BK atau psikolog sekolah jika tersedia',
    ],
    tips_observasi: [
      'Catat perilaku spesifik yang menonjol, bukan kesan umum',
      'Dokumentasikan konteks: kapan terjadi, situasinya seperti apa',
    ],
  },
}
