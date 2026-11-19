'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  FileSpreadsheet,
  Users,
  TrendingUp,
  CheckCircle2,
  Search,
  Calendar,
  Trash2,
  Download,
  RefreshCw,
  Filter,
} from 'lucide-react'

function extractScores(row: any): number[] {
  if (Array.isArray(row?.answers_json) && row.answers_json.length > 0) {
    return row.answers_json.map((v: any) => Number(v) || 0)
  }
  if (typeof row?.answers_json === 'string') {
    try {
      const parsed = JSON.parse(row.answers_json)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((v: any) => Number(v) || 0)
      }
    } catch {}
  }

  const qKeys = Object.keys(row || {})
    .filter((k) => /^q\d+$/i.test(k))
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))

  if (qKeys.length > 0) {
    return qKeys.map((k) => Number(row[k]) || 0)
  }

  return [
    row?.q1,
    row?.q2,
    row?.q3,
    row?.q4,
    row?.q5,
    row?.q6,
    row?.q7,
    row?.q8,
    row?.q9,
    row?.q10,
  ].map((v) => Number(v) || 0)
}

function getRowAverage(row: any, scores: number[]): number {
  const validScores = scores.filter((v) => v >= 1 && v <= 4)
  if (validScores.length > 0) {
    const sum = validScores.reduce((acc, val) => acc + val, 0)
    return Number((sum / validScores.length).toFixed(2))
  }
  const dbAvg = Number(row?.rata_rata)
  return !isNaN(dbAvg) && dbAvg > 0 ? Number(dbAvg.toFixed(2)) : 0
}

export default function RincianIndikatorPage() {
  const supabase = createClient()
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState('ALL')
  const [selectedDate, setSelectedDate] = useState('')

  const fetchAllResponses = useCallback(async () => {
    setLoading(true)
    let allData: any[] = []
    let from = 0
    const batchSize = 1000
    let hasMore = true

    while (hasMore) {
      const { data, error } = await supabase
        .from('survey_responses')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, from + batchSize - 1)

      if (error || !data || data.length === 0) {
        hasMore = false
      } else {
        allData = allData.concat(data)
        if (data.length < batchSize) {
          hasMore = false
        } else {
          from += batchSize
        }
      }
    }

    setRows(allData)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchAllResponses()
  }, [fetchAllResponses])

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Hapus data survei milik "${nama}"?`)) return
    const { error } = await supabase.from('survey_responses').delete().eq('id', id)
    if (!error) {
      setRows((prev) => prev.filter((item) => item.id !== id))
    } else {
      alert(`Gagal menghapus data: ${error.message}`)
    }
  }

  // Daftar kelas unik
  const uniqueClasses = Array.from(
    new Set(rows.map((r) => (r.kelas || '').trim().toUpperCase()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, 'id', { numeric: true }))

  // Filter data
  const filteredRows = rows.filter((r) => {
    const kelasUpper = (r.kelas || '').trim().toUpperCase()
    const matchClass = selectedClass === 'ALL' || kelasUpper === selectedClass

    const matchSearch =
      !searchQuery.trim() ||
      (r.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.email || '').toLowerCase().includes(searchQuery.toLowerCase())

    let matchDate = true
    if (selectedDate && r.created_at) {
      const rowDate = new Date(r.created_at).toISOString().slice(0, 10)
      matchDate = rowDate === selectedDate
    }

    return matchClass && matchSearch && matchDate
  })

  // Hitung rata-rata keseluruhan dari baris terfilter
  let sumAvg = 0
  let countAvg = 0
  filteredRows.forEach((r) => {
    const scores = extractScores(r)
    const avg = getRowAverage(r, scores)
    if (avg > 0) {
      sumAvg += avg
      countAvg += 1
    }
  })
  const overallAverage = countAvg > 0 ? Number((sumAvg / countAvg).toFixed(2)) : 0

  // Ekspor CSV lengkap dengan RATA-RATA yang sudah dihitung
  const handleExportCSV = () => {
    const headers = [
      'No',
      'Nama Siswa',
      'Kelas',
      'No Absen',
      'Email',
      'Q1',
      'Q2',
      'Q3',
      'Q4',
      'Q5',
      'Q6',
      'Q7',
      'Q8',
      'Q9',
      'Q10',
      'Rata-Rata',
      'Waktu Kirim',
    ]

    const csvLines = filteredRows.map((r, idx) => {
      const s = extractScores(r)
      const avg = getRowAverage(r, s)
      return [
        idx + 1,
        `"${(r.nama || '').replace(/"/g, '""')}"`,
        `"${(r.kelas || '').replace(/"/g, '""')}"`,
        r.no_absen ?? '',
        `"${(r.email || '').replace(/"/g, '""')}"`,
        s[0] ?? 0,
        s[1] ?? 0,
        s[2] ?? 0,
        s[3] ?? 0,
        s[4] ?? 0,
        s[5] ?? 0,
        s[6] ?? 0,
        s[7] ?? 0,
        s[8] ?? 0,
        s[9] ?? 0,
        avg.toFixed(2),
        `"${r.created_at ? new Date(r.created_at).toLocaleString('id-ID') : ''}"`,
      ].join(',')
    })

    const blob = new Blob([headers.join(',') + '\n' + csvLines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Rincian_Indikator_7KAIH_${selectedClass}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 font-sans text-[#090D16]">
      {/* Banner Header */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-800 to-sky-700 text-white p-6 sm:p-8 shadow-xl border border-indigo-400/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-extrabold text-sky-200 mb-2">
            <FileSpreadsheet size={13} />
            <span>MATRIKS SKOR 10 INDIKATOR • SMAN 5 SEMARANG</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
            Rincian Indikator (Q1–Q10)
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1">
            Detail skor setiap butir pertanyaan Q1 sampai Q10 beserta rata-rata otomatis per siswa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={fetchAllResponses}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-xs font-extrabold text-white cursor-pointer"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Segarkan</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold shadow-md cursor-pointer"
          >
            <Download size={15} />
            <span>Eksport CSV</span>
          </button>
        </div>
      </div>

      {/* 3 Kartu Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase text-slate-600">Total Responden</p>
            <p className="font-heading text-2xl font-black text-[#090D16]">
              {filteredRows.length.toLocaleString('id-ID')} Siswa
            </p>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase text-slate-600">Rata-Rata Skor</p>
            <p className="font-heading text-2xl font-black text-indigo-700">
              {overallAverage.toFixed(2)}{' '}
              <span className="text-sm font-bold text-slate-500">/ 4.0</span>
            </p>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase text-slate-600">Kelengkapan Soal</p>
            <p className="font-heading text-2xl font-black text-emerald-700">10 / 10 Terisi</p>
          </div>
        </div>
      </div>

      {/* Bar Filter */}
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1.5">
            Cari Nama / Email
          </label>
          <div className="relative">
            <Search size={15} className="text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik nama atau email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 bg-white text-xs font-semibold text-[#090D16] focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1.5">
            Filter Menurut Kelas
          </label>
          <div className="relative">
            <Filter size={15} className="text-indigo-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 bg-white text-xs font-extrabold text-[#090D16] focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="ALL">Semua Kelas ({rows.length.toLocaleString('id-ID')})</option>
              {uniqueClasses.map((kls) => (
                <option key={kls} value={kls}>
                  Kelas {kls}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1.5">
            Filter Menurut Tanggal
          </label>
          <div className="relative">
            <Calendar size={15} className="text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 bg-white text-xs font-semibold text-[#090D16] focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* Tabel Matriks Rincian Q1-Q10 */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-600">
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-3">Kelas</th>
                <th className="py-3.5 px-3">Email</th>
                <th className="py-3.5 px-3">Tanggal</th>
                <th className="py-3.5 px-3">Jawaban (Q1–Q10)</th>
                <th className="py-3.5 px-3 text-center">Rata-Rata</th>
                <th className="py-3.5 px-4 text-center">Hapus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 font-bold animate-pulse">
                    Memuat rincian indikator dari Supabase...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 font-bold">
                    Tidak ada data yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => {
                  const scores = extractScores(r)
                  const filledCount = scores.filter((v) => v >= 1 && v <= 4).length
                  const avg = getRowAverage(r, scores)

                  return (
                    <tr key={r.id} className="hover:bg-indigo-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-extrabold text-[#090D16] whitespace-nowrap">
                        {r.nama}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-900 font-extrabold">
                          {r.kelas}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">{r.email}</td>
                      <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                        {r.created_at
                          ? new Date(r.created_at).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {scores.slice(0, 10).map((val, idx) => (
                            <span
                              key={idx}
                              title={`Q${idx + 1}: ${val}`}
                              className="h-6 w-6 rounded-md bg-indigo-50 border border-indigo-200/80 text-indigo-950 font-black text-[11px] flex items-center justify-center"
                            >
                              {val || '-'}
                            </span>
                          ))}
                          <span className="ml-1.5 text-[11px] font-extrabold text-emerald-700">
                            ({filledCount}/10)
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-900 font-black">
                          {avg.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(r.id, r.nama)}
                          title="Hapus baris data"
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}