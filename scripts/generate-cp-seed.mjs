import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const sourcePath = path.join(root, 'cp_incluedu_database.json')
const outputPath = path.join(root, 'supabase', 'migrations', '202606220002_seed_curriculum_cp.sql')
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'))

const quote = (value) => `'${String(value ?? '').replaceAll("'", "''")}'`
const rows = []

for (const cp of source.capaian_pembelajaran ?? []) {
  for (const [index, element] of (cp.elemen ?? []).entries()) {
    rows.push({
      id: `${cp.id}-${index + 1}`,
      mata_pelajaran: cp.mata_pelajaran,
      fase: cp.fase,
      jenjang: cp.jenjang,
      kelas_setara: cp.kelas_setara,
      nama_elemen: element.nama_elemen,
      deskripsi_cp: element.deskripsi_cp,
      indikator_operasional: element.indikator_operasional ?? [],
    })
  }
}

const values = rows.map((row) => `(
  ${quote(row.id)},
  ${quote(row.mata_pelajaran)},
  ${quote(row.fase)},
  ${quote(row.jenjang)},
  ${quote(row.kelas_setara)},
  ${quote(row.nama_elemen)},
  ${quote(row.deskripsi_cp)},
  ${quote(JSON.stringify(row.indikator_operasional))}::jsonb
)`).join(',\n')

const sql = `-- Generated from cp_incluedu_database.json. Do not edit manually.
insert into public.curriculum_cp (
  id, mata_pelajaran, fase, jenjang, kelas_setara,
  nama_elemen, deskripsi_cp, indikator_operasional
) values
${values}
on conflict (id) do update set
  mata_pelajaran = excluded.mata_pelajaran,
  fase = excluded.fase,
  jenjang = excluded.jenjang,
  kelas_setara = excluded.kelas_setara,
  nama_elemen = excluded.nama_elemen,
  deskripsi_cp = excluded.deskripsi_cp,
  indikator_operasional = excluded.indikator_operasional;
`

fs.writeFileSync(outputPath, sql)
console.log(`Generated ${rows.length} CP elements at ${outputPath}`)
