import { NextResponse } from 'next/server'
import { deepseekJson } from '@/lib/deepseek'
import { normalizeAnalysis } from '@/lib/analysis-normalizer'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (body.action === 'classify') {
      const result = await deepseekJson<{
        kategori: string
        keyakinan: 'rendah' | 'sedang' | 'tinggi' | number
        alasan: string
        pertanyaan_lanjutan: string[]
        strategi_awal: string[]
      }>(
        'Kamu adalah asisten pendidikan inklusif. Kamu tidak boleh mendiagnosis kondisi medis. Berikan saran kebutuhan belajar yang harus dikonfirmasi guru.',
        `Analisis deskripsi guru berikut:
${body.description}

Pilih kategori paling sesuai dari: slow_learner, disleksia, adhd, autisme, tunanetra, tunarungu, hambatan_intelektual, hambatan_motorik, hambatan_komunikasi, lainnya, belum_teridentifikasi.
Kembalikan JSON dengan kategori, keyakinan, alasan singkat, 2-4 pertanyaan_lanjutan, dan 2-4 strategi_awal.`
      )
      const confidence = typeof result.keyakinan === 'number'
        ? result.keyakinan >= 0.8 ? 'tinggi' : result.keyakinan >= 0.55 ? 'sedang' : 'rendah'
        : result.keyakinan
      return NextResponse.json({ ...result, keyakinan: confidence })
    }

    if (body.action === 'ppi') {
      const result = await deepseekJson<{
        tujuan_jangka_panjang: string
        tujuan_jangka_pendek: Array<{ area: string; tujuan: string; indikator: string; target: number }>
        strategi: string[]
      }>(
        'Kamu membantu guru menyusun draf Program Pembelajaran Individual. Tujuan harus spesifik, terukur, realistis, dan berdasarkan kemampuan awal. Hasil selalu perlu ditinjau guru.',
        `Profil siswa: ${JSON.stringify(body.student)}
Asesmen awal: ${JSON.stringify(body.baseline)}
Susun satu tujuan jangka panjang, 2-4 tujuan jangka pendek, indikator terukur, target 0-100, dan strategi pembelajaran.`
      )
      const goals = (Array.isArray(result.tujuan_jangka_pendek) ? result.tujuan_jangka_pendek : [])
        .map((goal) => ({
          area: String(goal.area || 'Kebutuhan belajar'),
          tujuan: String(goal.tujuan || ''),
          indikator: String(goal.indikator || 'Dievaluasi melalui observasi berkala'),
          target: Math.min(100, Math.max(0, Number(goal.target) || 70)),
        }))
        .filter((goal) => goal.tujuan.length > 0)
      return NextResponse.json({
        tujuan_jangka_panjang: String(result.tujuan_jangka_panjang || ''),
        tujuan_jangka_pendek: goals,
        strategi: Array.isArray(result.strategi) ? result.strategi.map(String) : [],
      })
    }

    if (body.action === 'report') {
      const result = await deepseekJson(
        'Kamu adalah asisten pendidikan inklusif yang menyusun evaluasi perkembangan berbasis data observasi dan tujuan PPI. Gunakan bahasa empatik dan tidak membandingkan siswa dengan teman.',
        `Siswa: ${JSON.stringify(body.student)}
Tujuan PPI: ${JSON.stringify(body.goals)}
Observasi: ${JSON.stringify(body.observations)}
Kembalikan JSON: trend, nilai_kognitif, nilai_sosial, nilai_emosional, nilai_rata_rata, highlights, concerns, rekomendasi_guru, rapor_narasi, rekomendasi_ortu.`,
        2400
      )
      return NextResponse.json(normalizeAnalysis(result))
    }

    return NextResponse.json({ error: 'Action tidak didukung' }, { status: 400 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
