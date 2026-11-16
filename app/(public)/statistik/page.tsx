'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import RadarChart7KAIH from '@/components/public/RadarChart7KAIH'
import {
  BarChart3,
  Search,
  Sparkles,
  Calendar,
  Award,
  CheckCircle2,
  ArrowLeft,
  TrendingUp,
  User,
  Lightbulb,
} from 'lucide-react'

const SEVEN_KAIH_INDICATORS = [
  { key: 'Bangun Pagi', short: 'Bangun Pagi', target: 3.6, tip: 'Pasang alarm pukul 05.15 dan jauhkan ponsel dari kasur agar langsung bangun.' },
  { key: 'Beribadah', short: 'Beribadah', target: 3.6, tip: 'Jadikan waktu ibadah dan berdoa sebagai prioritas sebelum aktivitas lain.' },
  { key: 'Berolahraga', short: 'Berolahraga', target: 3.4, tip: 'Jadwalkan aktivitas fisik atau peregangan minimal 20 menit 3 kali seminggu.' },
  { key: 'Makan Sehat', short: 'Makan Sehat', target: 3.5, tip: 'Tambahkan minimal 1 porsi buah/sayur dan kurangi minuman manis kemasan.' },
  { key: 'Gemar', short: 'Gemar Membaca', target: 3.5, tip: 'Luangkan 15–30 menit membaca buku literasi atau artikel edukatif setiap hari.' },
  { key: 'Bermasyarakat', short: 'Bermasyarakat', target: 3.5, tip: 'Ambil inisiatif membantu orang tua dan peduli lingkungan sekitar.' },
  { key: 'Tidur Cepat', short: 'Tidur Cepat', target: 3.4, tip: 'Hentikan penggunaan gadget 30 menit sebelum pukul 22.00 agar tidur tepat waktu.' },
]

type DimensionScore = {
  label: string
  score: number
  target: number
}

const INDICATOR_DETAILS = SEVEN_KAIH_INDICATORS.map((indicator) => ({
  full: indicator.short,
  dimension: indicator.key,
}))

function getPredicate(score: number) {
  if (score >= 3.5) {
    return { label: 'Sangat Baik', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
  }
  if (score >= 2.5) {
    return { label: 'Baik', color: 'bg-blue-100 text-blue-700 border-blue-200' }
  }
  if (score >= 1.5) {
    return { label: 'Cukup', color: 'bg-amber-100 text-amber-700 border-amber-200' }
  }
  return { label: 'Perlu Peningkatan', color: 'bg-rose-100 text-rose-700 border-rose-200' }
}

type QuestionMeta = {
  question_text: string
  category: string
}

function parseRowScores(row: any): number[] {
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

  return [row?.q1, row?.q2, row?.q3, row?.q4, row?.q5, row?.q6, row?.q7, row?.q8, row?.q9, row?.q10].map(
    (v) => Number(v) || 0
  )
}

function computeRowAverage(row: any): number {
  const valid = parseRowScores(row).filter((v) => v >= 1 && v <= 4)
  if (valid.length > 0) {
    return Number((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2))
  }
  const dbAvg = Number(row?.rata_rata)
  return !isNaN(dbAvg) && dbAvg > 0 ? Number(dbAvg.toFixed(2)) : 0
}

function mapCategoryToIndicatorIndex(category: string, fallbackIdx: number): number {
  const lower = (category || '').toLowerCase()
  if (lower.includes('bangun')) return 0
  if (lower.includes('ibadah')) return 1
  if (lower.includes('olahraga')) return 2
  if (lower.includes('makan')) return 3
  if (lower.includes('baca') || lower.includes('belajar')) return 4
  if (lower.includes('masyarakat')) return 5
  if (lower.includes('tidur')) return 6

  // Fallback jika kategori kosong (pemetaan default 10 soal)
  const defaultMap = [0, 1, 1, 2, 2, 3, 4, 5, 6, 6]
  return defaultMap[fallbackIdx] ?? fallbackIdx % 7
}

function StatistikContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const emailFromQuery = searchParams.get('email') || ''

  const [lookupInput, setLookupInput] = useState(emailFromQuery)
  const [activeFilter, setActiveFilter] = useState(emailFromQuery)
  const [rows, setRows] = useState<any[]>([])
  const [questionMetas, setQuestionMetas] = useState<QuestionMeta[]>(
    INDICATOR_DETAILS.map((d) => ({ question_text: d.full, category: d.dimension }))
  )
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(
    async (filterVal: string) => {
      setLoading(true)

      const { data: qData } = await supabase
        .from('survey_questions')
        .select('question_text, category, order_index')
        .order('order_index', { ascending: true })

      if (qData && qData.length > 0) {
        setQuestionMetas(
          qData.map((q) => ({
            question_text: q.question_text,
            category: q.category || '',
          }))
        )
      }

      let query = supabase
        .from('survey_responses')
        .select('*')
        .order('created_at', { ascending: false })

      const clean = filterVal.trim().toLowerCase()
      if (clean) {
        if (clean.includes('@')) {
          query = query.ilike('email', clean)
        } else {
          query = query.ilike('nama', `%${clean}%`)
        }
      }

      const { data, error } = await query
      if (!error && Array.isArray(data)) {
        setRows(data)
      } else {
        setRows([])
      }
      setLoading(false)
    },
    [supabase]
  )

  useEffect(() => {
    setLookupInput(emailFromQuery)
    setActiveFilter(emailFromQuery)
    loadData(emailFromQuery)
  }, [emailFromQuery, loadData])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveFilter(lookupInput)
    loadData(lookupInput)
  }

  // Hitung rata-rata per 7 Indikator KAIH (dikelompokkan dari kategori soal)
  const indicatorSums = Array(7).fill(0)
  const indicatorCounts = Array(7).fill(0)
  let totalRowScoreSum = 0
  let validRowCount = 0

  rows.forEach((r) => {
    const scores = parseRowScores(r)
    scores.forEach((val: number, qIdx: number) => {
      if (val >= 1 && val <= 4) {
        const cat = questionMetas[qIdx]?.category || ''
        const indIdx = mapCategoryToIndicatorIndex(cat, qIdx)
        indicatorSums[indIdx] += val
        indicatorCounts[indIdx] += 1
      }
    })

    const rAvg = computeRowAverage(r)
    if (rAvg > 0) {
      totalRowScoreSum += rAvg
      validRowCount += 1
    }
  })

  const indicatorStats = SEVEN_KAIH_INDICATORS.map((ind, idx) => {
    const avg =
      indicatorCounts[idx] > 0
        ? Number((indicatorSums[idx] / indicatorCounts[idx]).toFixed(2))
        : 0
    return {
      ...ind,
      avg,
      pct: Math.min(100, Math.round((avg / 4) * 100)),
    }
  })

  const overallAverage =
    validRowCount > 0 ? Number((totalRowScoreSum / validRowCount).toFixed(2)) : 0
  const completionPct = Math.min(100, Math.round((overallAverage / 4) * 100))
  const predicate = getPredicate(overallAverage)

  const sevenDimensions: DimensionScore[] = indicatorStats.map((item) => ({
    label: item.short,
    score: item.avg,
    target: item.target,
  }))

  const latestStudent = rows[0]

  const weakestIndicator = [...indicatorStats]
    .filter((item) => item.avg > 0)
    .sort((a, b) => a.avg - b.avg)[0]

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-3 sm:px-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Beranda</span>
          </Link>

          <Link
            href="/survey"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-xl shadow-xs"
          >
            <span>+ Isi Survei Hari Ini</span>
          </Link>
        </div>

        {/* Header & Pencarian Email / Nama */}
        <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-md space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-bold">
            <Sparkles size={14} className="text-amber-300" />
            <span>Statistik & Rapor Karakter • Skala 1.0 – 4.0</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {activeFilter && latestStudent
                  ? `Statistik: ${latestStudent.nama}`
                  : 'Statistik Kebiasaan Siswa'}
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100">
                {activeFilter && latestStudent
                  ? `${latestStudent.kelas}${
                      latestStudent.no_absen ? ` • Absen ${latestStudent.no_absen}` : ''
                    } • ${latestStudent.email}`
                  : 'Menampilkan rekap seluruh pengisian atau cari berdasarkan email/nama siswa (Skala 4.0).'}
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search
                  size={15}
                  className="text-indigo-200 absolute left-3.5 top-1/2 -translate-y-1/2"
                />
                <input
                  type="text"
                  value={lookupInput}
                  onChange={(e) => setLookupInput(e.target.value)}
                  placeholder="Cari email atau nama siswa..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/15 border border-white/20 text-xs font-semibold text-white placeholder:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold cursor-pointer shrink-0"
              >
                Tampilkan
              </button>
            </form>
          </div>
        </div>

        {/* Kartu Ringkasan Skor */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase text-slate-400">Rata-Rata Skor</p>
              <p className="text-2xl font-black text-indigo-700">
                {overallAverage.toFixed(2)}{' '}
                <span className="text-xs font-bold text-slate-400">/ 4.0</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase text-slate-400">
                Persentase Capaian
              </p>
              <p className="text-2xl font-black text-emerald-600">{completionPct}%</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Award size={22} />
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase text-slate-400">
                Predikat ({rows.length} Entri)
              </p>
              <p className="text-sm font-black text-slate-800 mt-0.5">{predicate.label}</p>
            </div>
          </div>
        </div>

        {/* Grafik Radar & Grafik Diagram Batang Per Indikator 7 KAIH */}
        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center text-sm text-slate-400 animate-pulse">
            Memuat statistik jawaban...
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-3">
            <p className="text-sm font-bold text-slate-700">
              Belum ada data survei yang ditemukan untuk pencarian ini.
            </p>
            <Link
              href="/survey"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
            >
              Isi Survei Sekarang
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RadarChart7KAIH dimensions={sevenDimensions} />

              {/* Diagram Batang Vertikal Per Indikator 7 KAIH */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                      <BarChart3 size={18} className="text-indigo-600" />
                      <span>Diagram Batang per Indikator 7 KAIH</span>
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Rata-rata skor berdasarkan 7 kategori kebiasaan
                    </p>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 shrink-0">
                    Skala 0 – 4.0
                  </span>
                </div>

                {/* Area Plot Diagram Batang Vertikal */}
                <div className="relative pt-6 pb-2">
                  {/* Garis Bantu Horizontal Skala 4.0, 3.0, 2.0, 1.0 */}
                  <div className="relative h-56 flex items-end justify-between gap-2 sm:gap-3 pl-7 pr-1 border-b-2 border-slate-200">
                    {[4, 3, 2, 1].map((tick) => (
                      <div
                        key={tick}
                        className="absolute left-0 right-0 border-t border-dashed border-slate-200/80 flex items-center pointer-events-none"
                        style={{ bottom: `${(tick / 4) * 100}%` }}
                      >
                        <span className="text-[10px] font-bold text-slate-400 -translate-y-2.5">
                          {tick}.0
                        </span>
                      </div>
                    ))}

                    {/* 7 Batang Indikator KAIH */}
                    {indicatorStats.map((item, idx) => (
                      <div
                        key={idx}
                        className="relative z-10 flex-1 h-full flex flex-col justify-end items-center group"
                      >
                        {/* Nilai Skor di Atas Batang */}
                        <span className="mb-1.5 text-[11px] font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                          {item.avg.toFixed(2)}
                        </span>

                        {/* Batang Vertikal */}
                        <div
                          className="w-full max-w-[38px] rounded-t-xl bg-gradient-to-t from-indigo-600 via-indigo-500 to-purple-500 shadow-xs transition-all duration-500 group-hover:from-indigo-700 group-hover:to-purple-600"
                          style={{ height: `${Math.max(item.pct, item.avg > 0 ? 6 : 0)}%` }}
                          title={`${item.short}: ${item.avg.toFixed(2)} / 4.0`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Label Nama 7 Indikator di Bawah Sumbu X */}
                  <div className="flex items-start justify-between gap-2 sm:gap-3 pl-7 pr-1 pt-2.5">
                    {indicatorStats.map((item, idx) => (
                      <div key={idx} className="flex-1 text-center">
                        <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-700 leading-tight break-words">
                          {item.short}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Rekomendasi Peningkatan Kebiasaan */}
            {weakestIndicator && (
              <div className="bg-amber-50 border border-amber-200/80 p-5 rounded-3xl flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-2xl bg-amber-400/20 text-amber-700 flex items-center justify-center shrink-0">
                  <Lightbulb size={20} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
                    Saran Peningkatan Kebiasaan ({weakestIndicator.short} •{' '}
                    {weakestIndicator.avg.toFixed(2)} / 4.0)
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-amber-950 leading-relaxed">
                    {weakestIndicator.tip}
                  </p>
                </div>
              </div>
            )}

            {/* Riwayat Pengisian Harian */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-slate-800">
                Riwayat Pengisian ({rows.length} Sesi)
              </h2>

              <div className="space-y-3">
                {rows.map((r) => {
                  const rowAvg = computeRowAverage(r)
                  const rowPct = Math.min(100, Math.round((rowAvg / 4) * 100))
                  const rowPred = getPredicate(rowAvg)
                  const scores = parseRowScores(r).filter((v) => v >= 1 && v <= 4)

                  return (
                    <div
                      key={r.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                            <User size={14} className="text-indigo-600" />
                            {r.nama}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                            {r.kelas} {r.no_absen ? `• Absen ${r.no_absen}` : ''}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${rowPred.color}`}
                          >
                            {rowPred.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <Calendar size={12} />
                          <span>
                            {new Date(r.created_at).toLocaleString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>• Skor: [{scores.join(', ')}]</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 bg-white px-4 py-2 rounded-xl border border-slate-200">
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase text-slate-400">Rata-Rata</p>
                          <p className="text-base font-black text-indigo-700">
                            {rowAvg.toFixed(2)}{' '}
                            <span className="text-[11px] font-normal text-slate-400">/ 4.0</span>
                          </p>
                        </div>
                        <div className="h-7 w-px bg-slate-200" />
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase text-slate-400">Capaian</p>
                          <p className="text-base font-black text-emerald-600">{rowPct}%</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function StatistikPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
          Memuat statistik pribadi...
        </div>
      }
    >
      <StatistikContent />
    </Suspense>
  )
}