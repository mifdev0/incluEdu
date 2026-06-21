import { NextResponse } from 'next/server'
import { deepseekJson } from '@/lib/deepseek'
import { applyObservationScores, normalizeAnalysis } from '@/lib/analysis-normalizer'
import { observationsToProgress, progressTrend, type ObservationRow } from '@/lib/observation-progress'
import { ACCOMMODATION_OPTIONS, recommendedAccommodations } from '@/lib/accommodation-data'

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
        tujuan_jangka_pendek: Array<{
          area: string
          jenis_target: 'akademik' | 'non_akademik'
          mata_pelajaran: string
          fase_adaptasi: string
          elemen_cp: string
          tujuan: string
          indikator: string
          target: number
          aktivitas: string
          media_alat: string
          pelaksana: string
          frekuensi: string
          metode_evaluasi: string
          langkah_tugas: string[]
        }>
        strategi: string[]
      }>(
        'Kamu membantu guru menyusun draf Program Pembelajaran Individual sesuai prinsip PPI Kemendikbudristek 2021. Tujuan harus individual, spesifik, terukur, realistis, berdasarkan kekuatan dan kemampuan awal. AI hanya menyusun draf yang wajib ditinjau guru.',
        `Profil siswa: ${JSON.stringify(body.student)}
Asesmen awal: ${JSON.stringify(body.baseline)}
Susun satu tujuan jangka panjang, 2-4 tujuan jangka pendek, dan strategi pembelajaran.
Untuk target akademik, ikuti rekomendasi fase kemampuan pada input meskipun berbeda dari fase kelas administratif.
Setiap tujuan jangka pendek wajib memuat: area, jenis_target (akademik/non_akademik), mata_pelajaran, fase_adaptasi, elemen_cp, tujuan, indikator terukur, target 0-100, aktivitas pembelajaran, media_alat, pelaksana, frekuensi, metode_evaluasi, dan 2-5 langkah_tugas kecil yang dapat diamati.`
      )
      const goals = (Array.isArray(result.tujuan_jangka_pendek) ? result.tujuan_jangka_pendek : [])
        .map((goal) => {
          const tujuan = String(goal.tujuan || '')
          const indikator = String(goal.indikator || '')
          const generatedSteps = Array.isArray(goal.langkah_tugas) ? goal.langkah_tugas.map(String).filter(Boolean).slice(0, 6) : []
          return {
            area: String(goal.area || 'Kebutuhan belajar'),
            jenis_target: goal.jenis_target === 'akademik' ? 'akademik' : 'non_akademik',
            mata_pelajaran: String(goal.mata_pelajaran || ''),
            fase_adaptasi: String(goal.fase_adaptasi || ''),
            elemen_cp: String(goal.elemen_cp || ''),
            tujuan,
            indikator: indikator || tujuan,
            target: Math.min(100, Math.max(0, Number(goal.target) || 70)),
            aktivitas: String(goal.aktivitas || ''),
            media_alat: String(goal.media_alat || ''),
            pelaksana: String(goal.pelaksana || 'Guru kelas'),
            frekuensi: String(goal.frekuensi || 'Disesuaikan jadwal pembelajaran'),
            metode_evaluasi: String(goal.metode_evaluasi || 'Observasi kinerja'),
            langkah_tugas: generatedSteps.length > 0 ? generatedSteps : [indikator || tujuan].filter(Boolean),
          }
        })
        .filter((goal) => goal.tujuan.length > 0)
      return NextResponse.json({
        tujuan_jangka_panjang: String(result.tujuan_jangka_panjang || ''),
        tujuan_jangka_pendek: goals,
        strategi: Array.isArray(result.strategi) ? result.strategi.map(String) : [],
      })
    }

    if (body.action === 'accommodations') {
      const catalog = ACCOMMODATION_OPTIONS.map((option) => ({
        value: option.value,
        group: option.group,
        reference: option.when,
      }))
      const result = await deepseekJson<{
        ringkasan: string
        saran: Array<{ value: string; alasan: string }>
      }>(
        'Kamu membantu guru memilih akomodasi pembelajaran, bukan mendiagnosis siswa. Gunakan hanya pilihan yang tersedia dalam katalog. Pilih sedikit tetapi relevan berdasarkan hambatan yang benar-benar diamati.',
        `Kategori kebutuhan yang telah dikonfirmasi guru: ${String(body.category || 'belum diketahui')}
Deskripsi hambatan dari guru:
${String(body.description || '')}

Katalog akomodasi:
${JSON.stringify(catalog)}

Kembalikan JSON berisi ringkasan singkat dan 3-6 saran. Setiap saran wajib memiliki value yang sama persis dengan salah satu value dalam katalog dan alasan praktis satu kalimat.`,
        1400,
      )
      const allowed = new Set(ACCOMMODATION_OPTIONS.map((option) => option.value))
      const suggestions = (Array.isArray(result.saran) ? result.saran : [])
        .filter((item) => allowed.has(String(item.value)))
        .map((item) => ({ value: String(item.value), alasan: String(item.alasan || '') }))
        .filter((item, index, items) => items.findIndex((other) => other.value === item.value) === index)
        .slice(0, 6)
      const fallbackSuggestions = recommendedAccommodations(String(body.category || 'lainnya'))
        .slice(0, 3)
        .map((option) => ({
          value: option.value,
          alasan: option.when.replace(/^Pilih jika /, 'Relevan ketika '),
        }))
      return NextResponse.json({
        ringkasan: String(result.ringkasan || ''),
        saran: suggestions.length > 0 ? suggestions : fallbackSuggestions,
      })
    }

    if (body.action === 'assessment-summary') {
      const result = await deepseekJson<{
        kekuatan: string[]
        kebutuhan: string[]
        ringkasan: string
        saran_referral: string
      }>(
        'Kamu adalah asisten PPI pendidikan inklusif. Rangkum data asesmen guru secara objektif. Jangan mendiagnosis. Gunakan istilah kekuatan dan kebutuhan dukungan, bukan label negatif.',
        `Profil siswa: ${JSON.stringify(body.student)}
Hasil checklist asesmen: ${JSON.stringify(body.assessment)}

Kembalikan JSON berisi 3-6 kekuatan, 3-6 kebutuhan, ringkasan maksimal 3 kalimat, dan saran_referral singkat bila perlu. Jangan membuat kemampuan yang tidak tercatat.`,
        1600,
      )
      const assessmentRows = Array.isArray(body.assessment) ? body.assessment : []
      const fallbackStrengths = assessmentRows
        .filter((item: Record<string, unknown>) => item.hasil === 'mandiri' || item.hasil === 'kadang')
        .map((item: Record<string, unknown>) => String(item.kemampuan || ''))
        .filter(Boolean)
        .slice(0, 6)
      const fallbackNeeds = assessmentRows
        .filter((item: Record<string, unknown>) => item.hasil === 'butuh_bantuan' || item.hasil === 'belum_bisa')
        .map((item: Record<string, unknown>) => {
          const ability = String(item.kemampuan || '')
          return item.hasil === 'belum_bisa'
            ? `Perlu pembelajaran bertahap untuk ${ability.toLowerCase()}`
            : `Perlu bantuan dalam ${ability.toLowerCase()}`
        })
        .filter(Boolean)
        .slice(0, 6)
      const strengths = Array.isArray(result.kekuatan) ? result.kekuatan.map(String).filter(Boolean).slice(0, 6) : []
      const needs = Array.isArray(result.kebutuhan) ? result.kebutuhan.map(String).filter(Boolean).slice(0, 6) : []
      return NextResponse.json({
        kekuatan: strengths.length > 0 ? strengths : fallbackStrengths,
        kebutuhan: needs.length > 0 ? needs : fallbackNeeds,
        ringkasan: String(result.ringkasan || ''),
        saran_referral: String(result.saran_referral || ''),
      })
    }

    if (body.action === 'tracking-alert') {
      const result = await deepseekJson<{
        alert: boolean
        ringkasan: string
        saran_modifikasi: string[]
      }>(
        'Kamu membantu guru mengevaluasi strategi PPI dari log tingkat bantuan. Jangan menyalahkan siswa. Berikan modifikasi pembelajaran yang praktis.',
        `Tujuan: ${JSON.stringify(body.goal)}
Log 14 hari terakhir: ${JSON.stringify(body.tracking)}

Jika data menunjukkan stagnasi terutama tetap pada Bf selama sekitar dua minggu, alert harus true. Kembalikan ringkasan dan maksimal 4 saran_modifikasi.`,
        1200,
      )
      return NextResponse.json({
        alert: Boolean(result.alert),
        ringkasan: String(result.ringkasan || ''),
        saran_modifikasi: Array.isArray(result.saran_modifikasi) ? result.saran_modifikasi.map(String).slice(0, 4) : [],
      })
    }

    if (body.action === 'evaluation-v2') {
      const result = await deepseekJson<{
        ringkasan_semester: string
        evaluasi_target: Array<{ tujuan_id: string; narasi: string; rekomendasi: 'lanjut' | 'remedial' }>
        rekomendasi_guru: string[]
        rekomendasi_orang_tua: string[]
      }>(
        'Kamu menyusun evaluasi PPI berbasis data yang sudah dihitung sistem. Jangan mengubah angka. Gunakan bahasa empatik, konkret, dan tidak membandingkan siswa dengan standar teman sekelas.',
        `Profil siswa: ${JSON.stringify(body.student)}
Hasil target yang telah dihitung sistem: ${JSON.stringify(body.results)}
Tim PPI: ${JSON.stringify(body.team)}

Kembalikan JSON: ringkasan_semester, evaluasi_target (tujuan_id harus sama dengan input, narasi, rekomendasi lanjut/remedial), rekomendasi_guru, dan rekomendasi_orang_tua.`,
        2400,
      )
      return NextResponse.json({
        ringkasan_semester: String(result.ringkasan_semester || ''),
        evaluasi_target: Array.isArray(result.evaluasi_target) ? result.evaluasi_target : [],
        rekomendasi_guru: Array.isArray(result.rekomendasi_guru) ? result.rekomendasi_guru.map(String) : [],
        rekomendasi_orang_tua: Array.isArray(result.rekomendasi_orang_tua) ? result.rekomendasi_orang_tua.map(String) : [],
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
      const normalized = normalizeAnalysis(result)
      const progress = observationsToProgress(
        (Array.isArray(body.observations) ? body.observations : []) as ObservationRow[],
        String(body.student?.kategori || 'lainnya'),
      )
      const latest = progress[progress.length - 1]
      return NextResponse.json(applyObservationScores(normalized, latest ? {
        trend: progressTrend(progress),
        kognitif: latest.kognitif,
        fokus: latest.fokus,
        sosial: latest.sosial,
        emosi: latest.emosi,
      } : null))
    }

    return NextResponse.json({ error: 'Action tidak didukung' }, { status: 400 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
