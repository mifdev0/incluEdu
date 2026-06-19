const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'

export async function deepseekJson<T>(system: string, user: string, maxTokens = 2000): Promise<T> {
  if (!DEEPSEEK_API_KEY) throw new Error('DEEPSEEK_API_KEY belum dikonfigurasi')

  const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      messages: [
        { role: 'system', content: `${system}\nBalas hanya dengan JSON valid.` },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: maxTokens,
    }),
    cache: 'no-store',
  })

  if (!res.ok) throw new Error(`DeepSeek API error: ${res.status} ${await res.text()}`)
  const data = await res.json()
  const raw = data.choices?.[0]?.message?.content
  if (!raw) throw new Error('DeepSeek tidak mengembalikan konten')
  return JSON.parse(raw) as T
}

export async function analyzeObservasi(params: {
  namaSiswa: string
  kategoriABK: string
  observasiList: Record<string, string | number>[]
  periodeLabel: string
}) {
  const { namaSiswa, kategoriABK, observasiList, periodeLabel } = params

  const messages = [
    {
      role: 'system',
      content: 'Kamu adalah asisten pendidikan inklusif yang membantu guru menganalisis perkembangan siswa berkebutuhan khusus. Balas HANYA dengan JSON valid, tanpa penjelasan, tanpa markdown.',
    },
    {
      role: 'user',
      content: `
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
6. Tulis narasi rapor (2-3 paragraf) yang ditulis untuk orang tua, bahasa hangat dan humanis, fokus pada kemajuan dan potensi
7. Tulis 2-3 rekomendasi untuk orang tua di rumah (rekomendasi_ortu)

Konversi bobot ke nilai: mandiri/aktif/stabil/ya/lancar = 85-95, dengan_bantuan/kadang/sedang = 60-75, belum_bisa/menghindari/tidak = 40-55. Rata-ratakan nilai dari semua minggu per dimensi.

Balas HANYA JSON:
{
  "trend": "membaik" | "stagnan" | "menurun",
  "nilai_kognitif": number,
  "nilai_sosial": number,
  "nilai_emosional": number,
  "nilai_rata_rata": number,
  "highlights": ["string"],
  "concerns": ["string"],
  "rekomendasi_guru": ["string"],
  "rapor_narasi": "string",
  "rekomendasi_ortu": ["string"]
}
`,
    },
  ]

  return deepseekJson(messages[0].content, messages[1].content)
}
