import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function analyzeObservasi(params: {
  namaSiswa: string
  kategoriABK: string
  observasiList: Record<string, unknown>[]
  periodeLabel: string
}) {
  const { namaSiswa, kategoriABK, observasiList, periodeLabel } = params

  const prompt = `
Kamu adalah asisten pendidikan inklusif yang membantu guru menganalisis perkembangan siswa berkebutuhan khusus.

Data siswa:
- Nama: ${namaSiswa}
- Kategori ABK: ${kategoriABK}
- Periode observasi: ${periodeLabel}
- Jumlah observasi: ${observasiList.length} minggu

Data observasi mingguan:
${JSON.stringify(observasiList, null, 2)}

Tugas kamu:
1. Analisis tren perkembangan siswa ini secara keseluruhan: "membaik", "stagnan", atau "menurun"
2. Identifikasi 2-3 hal positif / kemajuan yang terdeteksi (highlights)
3. Identifikasi 2-3 area yang perlu perhatian lebih (concerns)
4. Berikan 3-4 rekomendasi strategi konkret untuk guru (rekomendasi_guru)
5. Hitung nilai angka per aspek (0-100):
   - nilai_kognitif: rata-rata dimensi kognitif (pemahaman instruksi, membaca, fokus, dll)
   - nilai_sosial: rata-rata dimensi sosial (interaksi sosial, komunikasi)
   - nilai_emosional: rata-rata kondisi emosi dan motivasi
6. Tulis narasi rapor (2-3 paragraf) yang:
   - Ditulis untuk orang tua, bukan untuk guru
   - Bahasa hangat dan humanis
   - Fokus pada kemajuan dan potensi, bukan kekurangan
   - Konkret dan spesifik, bukan generik
7. Tulis 2-3 rekomendasi untuk orang tua di rumah (rekomendasi_ortu)

Konversi bobot ke nilai: mandiri/aktif/stabil/ya/lancar = 85-95, dengan_bantuan/kadang/sedang = 60-75, belum_bisa/menghindari/tidak = 40-55. Rata-ratakan nilai dari semua minggu per dimensi.

Balas HANYA dengan JSON valid, tanpa penjelasan, tanpa markdown:
{
  "trend": "membaik" | "stagnan" | "menurun",
  "nilai_kognitif": number,
  "nilai_sosial": number,
  "nilai_emosional": number,
  "nilai_rata_rata": number,
  "highlights": ["string", "string"],
  "concerns": ["string", "string"],
  "rekomendasi_guru": ["string", "string", "string"],
  "rapor_narasi": "string paragraf panjang",
  "rekomendasi_ortu": ["string", "string"]
}
`

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
    max_tokens: 2000,
  })

  const raw = response.choices[0].message.content || ''
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}
