'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  FileBarChart2,
  Filter,
  TrendingUp,
  AlertTriangle,
  Users,
  RefreshCw,
} from 'lucide-react'

type QuestionRow = {
  id: string
  question_code: string
  question_text: string
  category?: string | null
  order_index?: number | null
}

type ResponseRow = {
  id: string
  kelas: string
  q1?: number | null
  q2?: number | null
  q3?: number | null
  q4?: number | null
  q5?: number | null
  q6?: number | null
  q7?: number | null
  q8?: number | null
  q9?: number | null
  q10?: number | null
  answers_json?: number[] | null
}

const FALLBACK_QUESTIONS: QuestionRow[] = [
  { id: '1', question_code: 'Q1', question_text: 'Saya bangun pagi tepat waktu.', category: 'Bangun Pagi', order_index: 1 },
  { id: '2', question_code: 'Q2', question_text: 'Saya beribadah sesuai keyakinan.', category: 'Beribadah', order_index: 2 },
  { id: '3', question_code: 'Q3', question_text: 'Saya berolahraga secara teratur.', category: 'Berolahraga', order_index: 3 },
  { id: '4', question_code: 'Q4', question_text: 'Saya mengonsumsi makanan sehat dan bergizi.', category: 'Makan Sehat', order_index: 4 },
  { id: '5', question_code: 'Q5', question_text: 'Saya meluangkan waktu untuk membaca.', category: 'Gemar Membaca', order_index: 5 },
  { id: '6', question_code: 'Q6', question_text: 'Saya membantu orang tua dan peduli lingkungan.', category: 'Bermasyarakat', order_index: 6 },
  { id: '7', question_code: 'Q7', question_text: 'Saya beristirahat dengan cukup.', category: 'Tidur Cepat', order_index: 7 },
  { id: '8', question_code: 'Q8', question_text: 'Saya belajar dengan tekun.', category: 'Belajar', order_index: 8 },
  { id: '9', question_code: 'Q9', question_text: 'Saya berinteraksi dengan baik.', category: 'Bersosialisasi', order_index: 9 },
  { id: '10', question_code: 'Q10', question_text: 'Saya mengatur waktu dengan baik.', category: 'Mengatur Waktu', order_index: 10 },
]

function extractRowScores(row: ResponseRow): (number | null)[] {
  if (Array.isArray(row?.answers_json) && row.answers_json.length > 0) {
    return Array.from({ length: 10 }, (_, idx) => {
      const val = Number(row.answers_json![idx])
      return Number.isFinite(val) && val >= 1 && val <= 4 ? val : null
    })
  }

  return Array.from({ length: 10 }, (_, idx) => {
    const key = `q${idx + 1}` as keyof ResponseRow
    const val = Number(row[key])
    return Number.isFinite(val) && val >= 1 && val <= 4 ? val : null
  })
}

export default function AdminIndicatorsPage() {
  const supabase = createClient()

  const [questions, setQuestions] = useState<QuestionRow[]>(FALLBACK_QUESTIONS)
  const [responses, setResponses] = useState<ResponseRow[]>([])
  const [selectedKelas, setSelectedKelas] = useState<string>('ALL')
  const [loading, setLoading] = useState<boolean>(true)

  const fetchData = useCallback(async () => {
    setLoading(true)

    // 1. Ambil daftar pertanyaan aktif dari Supabase
    const { data: qData } = await supabase
      .from('survey_questions')
      .select('*')
      .order('order_index', { ascending: true })

    if (qData && qData.length > 0) {
      const normalizedQuestions: QuestionRow[] = qData.map((item: any, idx: number) => ({
        id: String(item.id || idx + 1),
        question_code: item.question_code || item.code || `Q${idx + 1}`,
        question_text:
          item.question_text ||
          item.text ||
          item.pertanyaan ||
          FALLBACK_QUESTIONS[idx]?.question_text ||
          `Indikator #${idx + 1}`,
        category: item.category || item.kategori || FALLBACK_QUESTIONS[idx]?.category || '7 KAIH',
        order_index: item.order_index ?? idx + 1,
      }))
      setQuestions(normalizedQuestions)
    }

    // 2. Ambil seluruh rekapan jawaban dari Supabase (paginasi >1.000 baris)
    let allRows: ResponseRow[] = []
    let from = 0
    const pageSize = 1000

    while (true) {
      const { data, error } = await supabase
        .from('survey_responses')
        .select('id, kelas, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, answers_json')
        .range(from, from + pageSize - 1)

      if (error || !data || data.length === 0) break
      allRows = allRows.concat(data as ResponseRow[])
      if (data.length < pageSize) break
      from += pageSize
    }

    setResponses(allRows)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel('realtime-admin-indicators')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'survey_responses' },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'survey_questions' },
        () => fetchData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchData, supabase])

  const kelasList = useMemo(() => {
    const unique = Array.from(
      new Set(responses.map((r) => (r.kelas || '').trim()).filter(Boolean))
    )
    return unique.sort((a, b) => a.localeCompare(b, 'id'))
  }, [responses])

  const filteredResponses = useMemo(() => {
    if (selectedKelas === 'ALL') return responses
    return responses.filter((r) => (r.kelas || '').trim() === selectedKelas)
  }, [responses, selectedKelas])

  const indicatorStats = useMemo(() => {
    const parsedRows = filteredResponses.map(extractRowScores)

    return questions.map((q, idx) => {
      const code = q.question_code || `Q${idx + 1}`
      let totalScore = 0
      let count = 0
      const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 }

      parsedRows.forEach((scores) => {
        const val = scores[idx]
        if (val !== null && val >= 1 && val <= 4) {
          totalScore += val
          count += 1
          const rounded = Math.round(val)
          if (dist[rounded] !== undefined) dist[rounded] += 1
        }
      })

      const avg = count > 0 ? totalScore / count : 0
      const pct = Math.min(100, Math.round((avg / 4) * 100))

      return {
        ...q,
        code,
        count,
        avg,
        pct,
        dist,
      }
    })
  }, [questions, filteredResponses])

  const validStats = indicatorStats.filter((item) => item.count > 0)
  const highestIndicator =
    validStats.length > 0 ? [...validStats].sort((a, b) => b.avg - a.avg)[0] : null
  const lowestIndicator =
    validStats.length > 0 ? [...validStats].sort((a, b) => a.avg - b.avg)[0] : null

  return (
    <div className="space-y-6 font-sans text-[#090D16]">
      {/* Banner Header */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-950 via-blue-900 to-sky-700 text-white p-6 sm:p-8 shadow-xl border border-amber-300/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-extrabold text-amber-300 mb-2">
            <FileBarChart2 size={13} />
            <span>ANALISIS REAL-TIME PER INDIKATOR SURVEI</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
            Rincian Indikator (Q1–Q{questions.length})
          </h1>
          <p className="text-xs sm:text-sm text-sky-100 mt-1">
            Evaluasi skor rata-rata skala 1–4 dan distribusi jawaban siswa secara langsung dari database Supabase.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-xs font-extrabold text-white shrink-0 cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Filter Kelas & Ringkasan Sorotan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 kaih-glass-card p-5 rounded-3xl flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-blue-950 uppercase">
            <Filter size={15} className="text-blue-700" />
            <span>Filter Berdasarkan Kelas</span>
          </div>

          <select
            value={selectedKelas}
            onChange={(e) => setSelectedKelas(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 bg-white/90 text-xs sm:text-sm font-extrabold text-[#090D16] focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">Semua Kelas ({responses.length.toLocaleString('id-ID')} Rekapan)</option>
            {kelasList.map((kls) => (
              <option key={kls} value={kls}>
                Kelas {kls}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
            <Users size={14} className="text-blue-700" />
            <span>
              Menampilkan <strong>{filteredResponses.length.toLocaleString('id-ID')}</strong> data rekapan survei
            </span>
          </div>
        </div>

        {/* Indikator Tertinggi */}
        <div className="lg:col-span-4 kaih-glass-card p-5 rounded-3xl flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase text-emerald-800">
              <TrendingUp size={15} className="text-emerald-600" />
              <span>Indikator Tertinggi</span>
            </span>
            {highestIndicator && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black">
                {highestIndicator.avg.toFixed(2)} / 4.00 ({highestIndicator.pct}%)
              </span>
            )}
          </div>
          {highestIndicator ? (
            <div>
              <p className="font-heading text-sm font-black text-[#090D16]">
                {highestIndicator.code} • {highestIndicator.category || '7 KAIH'}
              </p>
              <p className="text-xs text-slate-700 line-clamp-2 mt-0.5">
                {highestIndicator.question_text}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Memuat data jawaban...</p>
          )}
        </div>

        {/* Indikator Perlu Perhatian */}
        <div className="lg:col-span-4 kaih-glass-card p-5 rounded-3xl flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase text-amber-800">
              <AlertTriangle size={15} className="text-amber-600" />
              <span>Perlu Penguatan</span>
            </span>
            {lowestIndicator && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 text-xs font-black">
                {lowestIndicator.avg.toFixed(2)} / 4.00 ({lowestIndicator.pct}%)
              </span>
            )}
          </div>
          {lowestIndicator ? (
            <div>
              <p className="font-heading text-sm font-black text-[#090D16]">
                {lowestIndicator.code} • {lowestIndicator.category || '7 KAIH'}
              </p>
              <p className="text-xs text-slate-700 line-clamp-2 mt-0.5">
                {lowestIndicator.question_text}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Memuat data jawaban...</p>
          )}
        </div>
      </div>

      {/* Daftar Kartu Rincian Q1 - Q10 */}
      {loading ? (
        <div className="kaih-glass-card p-10 rounded-3xl text-center text-xs font-bold text-slate-600 animate-pulse">
          Menghitung skor rincian indikator dari database Supabase...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {indicatorStats.map((item) => (
            <div
              key={item.id || item.code}
              className="kaih-glass-card p-6 rounded-3xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-blue-950 text-amber-300 text-xs font-black">
                      {item.code}
                    </span>
                    {item.category && (
                      <span className="px-2.5 py-1 rounded-xl bg-blue-100/90 text-blue-900 text-[11px] font-extrabold">
                        {item.category}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="font-heading text-lg font-black text-blue-950">
                      {item.avg.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-slate-500"> / 4.00</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-bold text-[#090D16] leading-relaxed">
                  {item.question_text}
                </p>
              </div>

              {/* Progress Bar Persentase */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-extrabold">
                  <span className="text-slate-600">
                    Capaian Indeks ({item.count.toLocaleString('id-ID')} responden)
                  </span>
                  <span className="text-blue-900">{item.pct}%</span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-200/80 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-900 via-sky-600 to-amber-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, item.pct))}%` }}
                  />
                </div>

                {/* Sebaran Skala 1 - 4 */}
                <div className="grid grid-cols-4 gap-2 pt-2">
                  {[
                    { score: 1, label: 'Skala 1 (Jarang)' },
                    { score: 2, label: 'Skala 2 (Kadang)' },
                    { score: 3, label: 'Skala 3 (Sering)' },
                    { score: 4, label: 'Skala 4 (Selalu)' },
                  ].map((s) => (
                    <div
                      key={s.score}
                      className="p-2 rounded-xl bg-white/75 border border-white text-center"
                    >
                      <p className="text-[10px] font-bold text-slate-500 truncate">{s.label}</p>
                      <p className="font-heading text-xs sm:text-sm font-black text-[#090D16] mt-0.5">
                        {(item.dist[s.score] || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}