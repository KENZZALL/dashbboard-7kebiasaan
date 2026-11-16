'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Download, Search, RefreshCw, Trash2 } from 'lucide-react'

const INDICATOR_HEADERS = [
  '1. Bangun Pagi',
  '2. Ibadah Tepat',
  '3. Berdoa Harian',
  '4. Olahraga 3x',
  '5. Ekskul/Sekolah',
  '6. Makan Sehat',
  '7. Gemar Membaca',
  '8. Bantu Ortu',
  '9. Tidur Cepat',
  '10. Bebas Gadget',
]

export default function AdminSurveyDatabasePage() {
  const supabase = createClient()
  const [rows, setRows] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const loadResponses = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('survey_responses')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setRows(data)
    setLoading(false)
  }

  useEffect(() => {
    loadResponses()
  }, [])

  const filtered = rows.filter(
    (r) =>
      r.nama?.toLowerCase().includes(search.toLowerCase()) ||
      r.kelas?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDownloadExcelCsv = () => {
    if (filtered.length === 0) return

    const headers = [
      'No',
      'Waktu Pengisian',
      'Nama Lengkap',
      'Kelas',
      'Email',
      ...INDICATOR_HEADERS,
      'Rata-Rata',
    ]

    const csvLines = [
      headers.join(','),
      ...filtered.map((r, i) => {
        const waktu = new Date(r.created_at).toLocaleString('id-ID')
        return [
          i + 1,
          `"${waktu}"`,
          `"${r.nama}"`,
          `"${r.kelas}"`,
          `"${r.email}"`,
          r.q1,
          r.q2,
          r.q3,
          r.q4,
          r.q5,
          r.q6,
          r.q7,
          r.q8,
          r.q9,
          r.q10,
          Number(r.rata_rata).toFixed(2),
        ].join(',')
      }),
    ]

    const blob = new Blob(['\uFEFF' + csvLines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Database_Survey_7KAIH_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data respon ini dari database?')) return
    await supabase.from('survey_responses').delete().eq('id', id)
    loadResponses()
  }

  return (
    <div className="p-4 sm:p-10 space-y-6 font-sans max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Database Jawaban Survei
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Seluruh hasil pengisian siswa tersimpan langsung di Supabase (skala 1–5) dan siap diunduh ke Excel.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadResponses}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadExcelCsv}
            disabled={filtered.length === 0}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Download size={15} />
            <span>Unduh Excel ({filtered.length})</span>
          </button>
        </div>
      </div>

      {/* Pencarian */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-2.5">
        <Search size={17} className="text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama siswa, kelas (contoh: XI-2), atau email..."
          className="w-full text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {/* Tabel Data */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-400 animate-pulse">
            Memuat database jawaban survei...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Belum ada data jawaban survei yang tercatat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[820px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-500">
                  <th className="py-3.5 px-4">Waktu</th>
                  <th className="py-3.5 px-4">Nama & Kelas</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Skor (Q1–Q10)</th>
                  <th className="py-3.5 px-4">Rata-Rata</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{r.nama}</p>
                      <p className="text-[11px] font-semibold text-blue-600">{r.kelas}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{r.email}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-1">
                        {[r.q1, r.q2, r.q3, r.q4, r.q5, r.q6, r.q7, r.q8, r.q9, r.q10].map(
                          (val, idx) => (
                            <span
                              key={idx}
                              title={INDICATOR_HEADERS[idx]}
                              className="w-6 h-6 rounded-md bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-[11px]"
                            >
                              {val}
                            </span>
                          )
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-indigo-700">
                      {Number(r.rata_rata).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        title="Hapus baris ini"
                        className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}