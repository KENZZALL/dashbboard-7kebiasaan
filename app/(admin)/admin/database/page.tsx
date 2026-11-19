'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Database,
  Search,
  Filter,
  Download,
  Trash2,
  Users,
  RefreshCw,
  FolderOpen,
  Calendar,
  XCircle,
  Sparkles,
} from 'lucide-react'

const ALL_ORDERED_CLASSES = [
  ...Array.from({ length: 12 }, (_, i) => `X-${i + 1}`),
  ...Array.from({ length: 12 }, (_, i) => `XI-${i + 1}`),
  ...Array.from({ length: 12 }, (_, i) => `XII-${i + 1}`),
]

function normalizeClassName(raw: string): string {
  return (raw || '')
    .replace(/^kelas\s+/i, '')
    .replace(/\./g, '-')
    .trim()
    .toUpperCase()
}

function sortClassNaturally(a: string, b: string): number {
  const rank: Record<string, number> = { X: 1, XI: 2, XII: 3 }
  const [gradeA, numA] = a.split('-')
  const [gradeB, numB] = b.split('-')
  const rA = rank[gradeA] || 99
  const rB = rank[gradeB] || 99
  if (rA !== rB) return rA - rB
  return (Number(numA) || 0) - (Number(numB) || 0)
}

function getRowAverage(row: any): number {
  const dbAvg = Number(row?.rata_rata)
  if (!isNaN(dbAvg) && dbAvg > 0) return Number(dbAvg.toFixed(2))

  const scores = Array.isArray(row?.answers_json)
    ? row.answers_json
    : [row?.q1, row?.q2, row?.q3, row?.q4, row?.q5, row?.q6, row?.q7, row?.q8, row?.q9, row?.q10]
  const valid = scores.map(Number).filter((v: number) => v >= 1 && v <= 4)
  if (valid.length === 0) return 0
  return Number((valid.reduce((a: number, b: number) => a + b, 0) / valid.length).toFixed(2))
}

export default function AdminDatabasePage() {
  const supabase = createClient()

  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState<string>('ALL')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  // === PAGINASI LOOP >1.000 BARIS AGAR SELURUH 1.193+ DATA TAMPIL & TEREKSPOR PENUH ===
  const fetchResponses = useCallback(async () => {
    setLoading(true)
    let allRows: any[] = []
    let from = 0
    const pageSize = 1000

    while (true) {
      const { data, error } = await supabase
        .from('survey_responses')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1)

      if (error || !data || data.length === 0) break
      allRows = allRows.concat(data)
      if (data.length < pageSize) break
      from += pageSize
    }

    setRows(allRows)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchResponses()

    const channel = supabase
      .channel('realtime-admin-database-page')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'survey_responses' },
        () => fetchResponses()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchResponses, supabase])

  const availableClasses = Array.from(
    new Set([
      ...ALL_ORDERED_CLASSES,
      ...rows.map((r) => normalizeClassName(r.kelas)).filter(Boolean),
    ])
  ).sort(sortClassNaturally)

  const countByClass: Record<string, number> = {}
  rows.forEach((r) => {
    const k = normalizeClassName(r.kelas)
    if (k) countByClass[k] = (countByClass[k] || 0) + 1
  })

  const filteredRows = rows
    .filter((r) => {
      const rowClass = normalizeClassName(r.kelas)
      if (selectedClass !== 'ALL' && rowClass !== selectedClass) {
        return false
      }
      if (selectedDate) {
        const rowDate = new Date(r.created_at).toISOString().slice(0, 10)
        if (rowDate !== selectedDate) return false
      }
      if (!searchTerm.trim()) return true
      const q = searchTerm.toLowerCase()
      return (
        (r.nama || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q) ||
        String(r.no_absen || '').includes(q) ||
        rowClass.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      const clsCmp = sortClassNaturally(
        normalizeClassName(a.kelas),
        normalizeClassName(b.kelas)
      )
      if (clsCmp !== 0) return clsCmp
      return (Number(a.no_absen) || 999) - (Number(b.no_absen) || 999)
    })

  const handleDeleteRow = async (id: string, nama: string) => {
    if (!confirm(`Hapus data survei milik "${nama}"?`)) return
    await supabase.from('survey_responses').delete().eq('id', id)
    fetchResponses()
  }

  const handleExportCSV = () => {
    const headers = ['No Absen', 'Nama', 'Kelas', 'Email', 'Rata-Rata (Skala 4.0)', 'Waktu Isi']
    const csvRows = filteredRows.map((r) => [
      r.no_absen || '-',
      `"${(r.nama || '').replace(/"/g, '""')}"`,
      normalizeClassName(r.kelas) || '-',
      r.email || '-',
      getRowAverage(r).toFixed(2),
      `"${new Date(r.created_at).toLocaleString('id-ID')}"`,
    ])
    const csvContent =
      '\uFEFF' + [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `rekap-survey-${selectedClass}-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5 font-sans text-[#090D16]">
      {/* Banner Header Indigo - Ungu - Biru Langit */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-800 to-sky-700 text-white p-6 sm:p-7 shadow-xl border border-indigo-400/20 flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <Sparkles
          size={130}
          className="absolute -right-6 -bottom-6 text-white/[0.07] pointer-events-none"
        />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-extrabold text-sky-200 mb-2">
            <Database size={12} />
            <span>REKAPITULASI PER KELAS • SMAN 5 SEMARANG</span>
          </div>
          <h1 className="font-heading text-xl sm:text-2xl font-black text-white">
            Database Hasil Survey 7 KAIH
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 font-medium mt-1">
            Menampilkan{' '}
            <strong className="text-white">
              {filteredRows.length.toLocaleString('id-ID')} responden
            </strong>{' '}
            terfilter dari{' '}
            <strong className="text-sky-200">
              {rows.length.toLocaleString('id-ID')} total rekapan
            </strong>{' '}
            Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10">
          <button
            type="button"
            onClick={fetchResponses}
            className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Segarkan</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredRows.length === 0}
            className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
          >
            <Download size={14} />
            <span>Eksport Excel (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter Kelas Urut, Tanggal Opsional & Pencarian */}
      <div className="kaih-glass-card p-5 rounded-3xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Filter Menurut Kelas */}
          <div className="md:col-span-4">
            <label className="block text-[11px] font-extrabold uppercase text-[#090D16] mb-1.5">
              Filter Menurut Kelas
            </label>
            <div className="relative">
              <Filter
                size={15}
                className="text-indigo-700 absolute left-3.5 top-1/2 -translate-y-1/2"
              />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-300 bg-white/95 text-sm font-bold text-[#090D16] focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="ALL">
                  Semua Kelas ({rows.length.toLocaleString('id-ID')} Data)
                </option>
                <optgroup label="Kelas X">
                  {availableClasses
                    .filter((c) => c.startsWith('X-'))
                    .map((c) => (
                      <option key={c} value={c}>
                        Kelas {c} ({countByClass[c] || 0} Siswa)
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Kelas XI">
                  {availableClasses
                    .filter((c) => c.startsWith('XI-'))
                    .map((c) => (
                      <option key={c} value={c}>
                        Kelas {c} ({countByClass[c] || 0} Siswa)
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Kelas XII">
                  {availableClasses
                    .filter((c) => c.startsWith('XII-'))
                    .map((c) => (
                      <option key={c} value={c}>
                        Kelas {c} ({countByClass[c] || 0} Siswa)
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Filter Menurut Tanggal (Opsional) */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-extrabold uppercase text-[#090D16] mb-1.5">
              Filter Tanggal (Opsional)
            </label>
            <div className="relative">
              <Calendar
                size={15}
                className="text-slate-700 absolute left-3.5 top-1/2 -translate-y-1/2"
              />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-slate-300 bg-white/95 text-sm font-bold text-[#090D16] focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Pencarian Nama / Absen */}
          <div className="md:col-span-5">
            <label className="block text-[11px] font-extrabold uppercase text-[#090D16] mb-1.5">
              Cari Nama / Absen Siswa
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="text-slate-700 absolute left-3.5 top-1/2 -translate-y-1/2"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ketik nama siswa atau absen..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-300 bg-white/95 text-sm font-bold text-[#090D16] focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {(selectedClass !== 'ALL' || selectedDate || searchTerm) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClass('ALL')
                    setSelectedDate('')
                    setSearchTerm('')
                  }}
                  className="px-3.5 py-2.5 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-extrabold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <XCircle size={14} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Pintasan Cepat Kelas */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-extrabold text-slate-800 shrink-0 flex items-center gap-1">
            <FolderOpen size={13} className="text-indigo-700" /> Pilih Kelas:
          </span>
          <button
            type="button"
            onClick={() => setSelectedClass('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold shrink-0 cursor-pointer transition-all ${
              selectedClass === 'ALL'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                : 'bg-white/90 border border-white text-[#090D16] hover:bg-white'
            }`}
          >
            Semua ({rows.length.toLocaleString('id-ID')})
          </button>
          {availableClasses.map((cls) => {
            const count = countByClass[cls] || 0
            const active = selectedClass === cls
            return (
              <button
                key={cls}
                type="button"
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-xs'
                    : count > 0
                    ? 'bg-indigo-100/90 text-indigo-900 hover:bg-indigo-200/80'
                    : 'bg-white/75 text-slate-700 hover:bg-white'
                }`}
              >
                {cls} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Tabel Daftar Nama Siswa */}
      <div className="kaih-glass-card rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-300/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-indigo-700" />
            <h2 className="font-heading text-sm sm:text-base font-extrabold text-[#090D16]">
              {selectedClass === 'ALL'
                ? `Seluruh Kelas (${filteredRows.length.toLocaleString('id-ID')} Data)`
                : `Daftar Siswa Kelas ${selectedClass} (${filteredRows.length.toLocaleString('id-ID')} Data)`}
            </h2>
          </div>
          <span className="text-[11px] font-extrabold text-slate-800">
            Urut Kelas & No. Absen
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm font-bold text-slate-800 animate-pulse">
            Memuat seluruh data survei dari Supabase...
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="p-10 text-center text-sm font-bold text-slate-800">
            Tidak ada data survey yang cocok untuk filter saat ini. Klik tombol{' '}
            <button
              type="button"
              onClick={() => {
                setSelectedClass('ALL')
                setSelectedDate('')
                setSearchTerm('')
              }}
              className="text-indigo-700 underline font-extrabold cursor-pointer"
            >
              Reset Filter
            </button>{' '}
            untuk menampilkan seluruh siswa.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-indigo-950/5 border-b border-slate-300/70 text-[11px] font-extrabold uppercase text-[#090D16]">
                  <th className="py-3.5 px-4">Absen</th>
                  <th className="py-3.5 px-4">Nama Siswa</th>
                  <th className="py-3.5 px-4">Kelas</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Rata-Rata</th>
                  <th className="py-3.5 px-4">Waktu Kirim</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 text-xs sm:text-sm bg-white/85">
                {filteredRows.map((r) => {
                  const avg = getRowAverage(r)
                  return (
                    <tr key={r.id} className="hover:bg-indigo-50/75 transition-colors">
                      <td className="py-3.5 px-4 font-black text-[#090D16]">
                        {r.no_absen || '-'}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-[#090D16]">{r.nama}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-900 text-xs font-extrabold">
                          {normalizeClassName(r.kelas)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium text-xs">
                        {r.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-black text-xs">
                          {avg.toFixed(2)} / 4.0
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium text-xs">
                        {new Date(r.created_at).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(r.id, r.nama)}
                          className="p-2 rounded-lg text-rose-700 hover:bg-rose-100 cursor-pointer"
                          title="Hapus baris"
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