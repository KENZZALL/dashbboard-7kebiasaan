'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Download,
  Search,
  RefreshCw,
  Trash2,
  ArrowLeft,
  Users,
  TrendingUp,
  CheckCircle2,
  Calendar,
} from 'lucide-react'

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
  const [selectedClass, setSelectedClass] = useState('ALL')
  const [selectedDate, setSelectedDate] = useState('')
  const [loading, setLoading] = useState(true)

  const loadResponses = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('survey_responses')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setRows(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadResponses()
  }, [])

  const uniqueClasses = Array.from(
    new Set(rows.map((r) => String(r.kelas || '').trim()).filter(Boolean))
  ).sort()

  const filtered = rows.filter((r) => {
    const namaStr = String(r.nama || '').toLowerCase()
    const kelasStr = String(r.kelas || '').toLowerCase()
    const emailStr = String(r.email || '').toLowerCase()
    const q = search.toLowerCase()

    const matchSearch = !q || namaStr.includes(q) || kelasStr.includes(q) || emailStr.includes(q)
    const matchClass = selectedClass === 'ALL' || String(r.kelas || '').trim() === selectedClass
    const rowDateIso = r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : ''
    const matchDate = !selectedDate || rowDateIso === selectedDate

    return matchSearch && matchClass && matchDate
  })

  const avgAll =
    filtered.length > 0
      ? (
          filtered.reduce((acc, r) => acc + (Number(r.rata_rata) || 0), 0) / filtered.length
        ).toFixed(2)
      : '0.00'

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
          `"${r.nama || '-'}"`,
          `"${r.kelas || '-'}"`,
          `"${r.email || '-'}"`,
          Number(r.q1) || 0,
          Number(r.q2) || 0,
          Number(r.q3) || 0,
          Number(r.q4) || 0,
          Number(r.q5) || 0,
          Number(r.q6) || 0,
          Number(r.q7) || 0,
          Number(r.q8) || 0,
          Number(r.q9) || 0,
          Number(r.q10) || 0,
          Number(r.rata_rata || 0).toFixed(2),
        ].join(',')
      }),
    ]

    const blob = new Blob(['\uFEFF' + csvLines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Database_Hasil_Survey_7KAIH_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus baris respon ini dari Supabase?')) return
    await supabase.from('survey_responses').delete().eq('id', id)
    loadResponses()
  }

  return (
    <div className="p-4 sm:p-8 lg:p-10 space-y-6 font-sans max-w-6xl">
      {/* Header & Tombol Back ke Beranda */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 mb-2"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Beranda Utama</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Database Hasil Survey
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Rekapitulasi otomatis seluruh jawaban siswa dari tabel Supabase.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={loadResponses}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <RefreshCw size={15} />
            <span>Sinkronkan</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadExcelCsv}
            disabled={filtered.length === 0}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Download size={15} />
            <span>Unduh Excel (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Ringkasan Statistik Admin */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Total Responden</p>
            <p className="text-2xl font-black text-slate-900">{filtered.length} Siswa</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Rata-Rata Skor</p>
            <p className="text-2xl font-black text-indigo-600">{avgAll} / 5.0</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Kelengkapan Soal</p>
            <p className="text-2xl font-black text-emerald-600">10 / 10 Terisi</p>
          </div>
        </div>
      </div>

      {/* Filter Kelas, Tanggal & Pencarian */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">
            Cari Nama / Email
          </label>
          <div className="relative">
            <Search size={15} className="text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ketik nama atau email..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">
            Filter Menurut Kelas
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">Semua Kelas</option>
            {uniqueClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">
            Filter Menurut Tanggal
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Tabel Data Responden */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400 animate-pulse">
            Memuat data dari Supabase...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Belum ada data responden yang sesuai filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[880px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-500">
                  <th className="py-3.5 px-4">No</th>
                  <th className="py-3.5 px-4">Nama Lengkap</th>
                  <th className="py-3.5 px-4">Kelas</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Jawaban (Q1–Q10)</th>
                  <th className="py-3.5 px-4">Rata-Rata</th>
                  <th className="py-3.5 px-4 text-right">Hapus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((r, index) => {
                  const scores = [
                    Number(r.q1) || 0,
                    Number(r.q2) || 0,
                    Number(r.q3) || 0,
                    Number(r.q4) || 0,
                    Number(r.q5) || 0,
                    Number(r.q6) || 0,
                    Number(r.q7) || 0,
                    Number(r.q8) || 0,
                    Number(r.q9) || 0,
                    Number(r.q10) || 0,
                  ]
                  const filledCount = scores.filter((s) => s >= 1 && s <= 5).length

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 font-bold text-slate-500">{index + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{r.nama || '-'}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-[11px]">
                          {r.kelas || '-'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{r.email || '-'}</td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(r.created_at).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          {scores.map((val, idx) => (
                            <span
                              key={idx}
                              title={INDICATOR_HEADERS[idx]}
                              className="w-6 h-6 rounded-md bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-[11px]"
                            >
                              {val}
                            </span>
                          ))}
                          <span className="ml-1.5 text-[10px] font-bold text-emerald-600">
                            ({filledCount}/10)
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-black text-indigo-700">
                        {Number(r.rata_rata || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(r.id)}
                          className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}