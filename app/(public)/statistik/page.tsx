'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import RadarChart7KAIH from '@/components/public/RadarChart7KAIH'
import {
  Search,
  RefreshCw,
  Calendar,
  Award,
  TrendingUp,
  ClipboardCheck,
  UserCheck,
  AlertCircle,
  Download,
  Lightbulb,
  Share2,
} from 'lucide-react'

interface StudentSubmission {
  id: string
  timestamp: string
  nama: string
  kelas: string
  email: string
  scores: number[]
  rowAvg: number
}

const INDICATOR_DETAILS = [
  { id: 1, short: 'Bangun Pagi', dimension: 'Bangun Pagi', actionTip: 'Atur alarm dan bangun pada waktu yang sama setiap hari.' },
  { id: 2, short: 'Beribadah', dimension: 'Beribadah', actionTip: 'Luangkan waktu untuk beribadah sesuai keyakinan.' },
  { id: 3, short: 'Berolahraga', dimension: 'Berolahraga', actionTip: 'Lakukan aktivitas fisik ringan setiap hari.' },
  { id: 4, short: 'Makan Sehat', dimension: 'Makan Sehat dan Bergizi', actionTip: 'Pilih makanan bergizi dan minum air putih yang cukup.' },
  { id: 5, short: 'Gemar Belajar', dimension: 'Gemar Belajar', actionTip: 'Sediakan waktu untuk membaca atau mempelajari hal baru.' },
  { id: 6, short: 'Bermasyarakat', dimension: 'Bermasyarakat', actionTip: 'Sapa dan bantu orang-orang di lingkungan sekitar.' },
  { id: 7, short: 'Tidur Cepat', dimension: 'Tidur Cepat', actionTip: 'Kurangi penggunaan gawai sebelum tidur dan tidur tepat waktu.' },
  { id: 8, short: 'Kesiapan Pagi', dimension: 'Bangun Pagi', actionTip: 'Siapkan kebutuhan esok hari sejak malam.' },
  { id: 9, short: 'Kebugaran', dimension: 'Berolahraga', actionTip: 'Biasakan bergerak aktif dalam kegiatan sehari-hari.' },
  { id: 10, short: 'Kepedulian', dimension: 'Bermasyarakat', actionTip: 'Lakukan satu tindakan baik untuk orang lain hari ini.' },
]

function getPredicate(score: number) {
  if (score >= 4.5) return { badge: 'Tingkat 4', label: 'Master Karakter', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  if (score >= 3.5) return { badge: 'Tingkat 3', label: 'Berkembang', color: 'bg-blue-50 text-blue-700 border-blue-200' }
  if (score >= 2.5) return { badge: 'Tingkat 2', label: 'Mulai Berkembang', color: 'bg-amber-50 text-amber-700 border-amber-200' }
  return { badge: 'Tingkat 1', label: 'Perlu Bimbingan', color: 'bg-rose-50 text-rose-700 border-rose-200' }
}

function mapToSevenDimensions(scores: number[]): any {
  const dimensions = [
    { name: 'Bangun Pagi', indices: [0, 7] },
    { name: 'Beribadah', indices: [1] },
    { name: 'Berolahraga', indices: [2, 8] },
    { name: 'Makan Sehat dan Bergizi', indices: [3] },
    { name: 'Gemar Belajar', indices: [4] },
    { name: 'Bermasyarakat', indices: [5, 9] },
    { name: 'Tidur Cepat', indices: [6] },
  ]
  return dimensions.map(({ name, indices }) => {
    const values = indices.map((index) => scores[index]).filter((value) => value > 0)
    return {
      name,
      value: values.length
        ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2))
        : 0,
    }
  })
}

export default function StatistikPribadiPage() {
  const supabase = createClient()

  const [emailInput, setEmailInput] = useState('')
  const [activeEmail, setActiveEmail] = useState('')
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const fetchStudentData = useCallback(async (targetEmail: string, isManualRefresh = false) => {
    const cleanEmail = targetEmail.trim().toLowerCase()
    if (!cleanEmail) {
      setLoading(false)
      return
    }

    if (isManualRefresh) setRefreshing(true)
    else setLoading(true)
    setErrorMsg('')

    const { data, error } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('email', cleanEmail)
      .order('created_at', { ascending: false })

    if (error) {
      setErrorMsg('Gagal memuat data dari database: ' + error.message)
      setLoading(false)
      setRefreshing(false)
      return
    }

    const mapped: StudentSubmission[] = (data || []).map((row: any) => {
      const scores = [
        Number(row.q1) || 0,
        Number(row.q2) || 0,
        Number(row.q3) || 0,
        Number(row.q4) || 0,
        Number(row.q5) || 0,
        Number(row.q6) || 0,
        Number(row.q7) || 0,
        Number(row.q8) || 0,
        Number(row.q9) || 0,
        Number(row.q10) || 0,
      ]
      const formattedDate = new Date(row.created_at).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      return {
        id: row.id,
        timestamp: formattedDate,
        nama: row.nama,
        kelas: row.kelas,
        email: row.email,
        scores,
        rowAvg: Number(row.rata_rata) || 0,
      }
    })

    setSubmissions(mapped)
    setActiveEmail(cleanEmail)
    localStorage.setItem('kaih_student_email', cleanEmail)
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('kaih_student_email') || ''
    if (saved) {
      setEmailInput(saved)
      fetchStudentData(saved)
    } else {
      setLoading(false)
    }
  }, [fetchStudentData])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput.trim()) return
    fetchStudentData(emailInput)
  }

  const indicatorAverages = Array.from({ length: 10 }, (_, idx) => {
    const vals = submissions
      .map((s) => s.scores[idx])
      .filter((v) => typeof v === 'number' && v >= 1 && v <= 5)
    if (vals.length === 0) return 0
    return Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2))
  })

  const overallAverage =
    submissions.length > 0
      ? Number(
          (
            submissions.reduce((acc, item) => acc + item.rowAvg, 0) / submissions.length
          ).toFixed(2)
        )
      : 0

  const overallPct = Math.min(100, Math.round((overallAverage / 5) * 100))
  const predicate = getPredicate(overallAverage)
  const studentProfile = submissions[0]
  const personalDimensions = mapToSevenDimensions(indicatorAverages)

  // Ambil 2 indikator terendah untuk Action Plan personal
  const lowestTwoIndicators = INDICATOR_DETAILS.map((ind, idx) => ({
    ...ind,
    avg: indicatorAverages[idx] || 0,
  }))
    .filter((item) => item.avg > 0)
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 2)

  // Generator Kartu Rapor Karakter PNG HD via HTML5 Canvas
  const handleDownloadReportCardPng = () => {
    if (!studentProfile) return
    const canvas = document.createElement('canvas')
    canvas.width = 900
    canvas.height = 540
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const grad = ctx.createLinearGradient(0, 0, 900, 540)
    grad.addColorStop(0, '#312e81')
    grad.addColorStop(0.55, '#4f46e5')
    grad.addColorStop(1, '#7e22ce')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 900, 540)

    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.beginPath()
    ctx.roundRect(40, 40, 820, 460, 28)
    ctx.fill()

    ctx.fillStyle = '#c7d2fe'
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText('NEXARA • 7 KEBIASAAN ANAK INDONESIA HEBAT', 75, 95)
    ctx.fillText('SMAN 5 SEMARANG', 75, 122)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText(studentProfile.nama, 75, 195)

    ctx.fillStyle = '#e0e7ff'
    ctx.font = '22px sans-serif'
    ctx.fillText(`Kelas ${studentProfile.kelas}  •  ${submissions.length} Hari Tercatat`, 75, 232)

    ctx.fillStyle = '#fef08a'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText(`Predikat: ${predicate.badge} (${predicate.label})`, 75, 280)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 64px sans-serif'
    ctx.fillText(`${overallAverage.toFixed(2)}`, 75, 395)

    ctx.fillStyle = '#c7d2fe'
    ctx.font = '24px sans-serif'
    ctx.fillText('/ 5.00 Skor Rata-Rata Karakter', 225, 395)

    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.font = '16px sans-serif'
    ctx.fillText(
      `Dicetak pada ${new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })}`,
      75,
      465
    )

    const link = document.createElement('a')
    link.download = `Kartu_Karakter_7KAIH_${studentProfile.nama.replace(/\s+/g, '_')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handleDownloadCsv = () => {
    if (submissions.length === 0) return
    const headers = [
      'Waktu Pengisian',
      'Nama Lengkap',
      'Kelas',
      'Email',
      ...INDICATOR_DETAILS.map((n, i) => `${i + 1}. ${n.short}`),
      'Rata-Rata',
    ]
    const csvRows = [
      headers.join(','),
      ...submissions.map((s) =>
        [
          `"${s.timestamp}"`,
          `"${s.nama}"`,
          `"${s.kelas}"`,
          `"${s.email}"`,
          ...s.scores,
          s.rowAvg.toFixed(2),
        ].join(',')
      ),
    ]
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Rekap_7KAIH_${activeEmail}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-5 sm:space-y-6">
        <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Statistik Pribadi & Rapor Karakter
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Rekap otomatis hasil pengisian hari ini dan hari-hari sebelumnya dari database.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {submissions.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleDownloadReportCardPng}
                    className="px-3.5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 size={14} />
                    <span>Kartu Rapor PNG</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    className="px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Unduh Excel</span>
                  </button>
                </>
              )}

              <Link
                href="/survey"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all"
              >
                + Isi Survei Hari Ini
              </Link>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search
                size={17}
                className="text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              />
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Tuliskan email pribadi kalian yang dipakai saat mengisi survei"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
              >
                Tampilkan Data
              </button>

              {activeEmail && (
                <button
                  type="button"
                  onClick={() => fetchStudentData(activeEmail, true)}
                  disabled={refreshing}
                  className="px-3.5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                  <span className="hidden sm:inline">Muat Ulang</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center text-sm text-slate-400 animate-pulse">
            Memuat riwayat pengisian...
          </div>
        ) : !activeEmail ? (
          <div className="bg-white p-10 rounded-3xl border border-slate-100 text-center space-y-2">
            <p className="text-base font-bold text-slate-800">
              Masukkan Email Pribadi Kalian di Atas
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Gunakan email yang sama dengan yang kalian tuliskan pada formulir <strong>Yuk Survey!</strong>.
            </p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border border-slate-100 text-center space-y-3">
            <p className="text-base font-bold text-slate-800">
              Belum Ditemukan Data untuk <span className="text-indigo-600">{activeEmail}</span>
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Pastikan penulisan email sama persis dengan yang diisikan pada formulir survei.
            </p>
            <div className="pt-2">
              <Link
                href="/survey"
                className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                Isi Survei Sekarang →
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-indigo-700 to-purple-800 text-white p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold">
                  <UserCheck size={15} />
                  <span>Profil Siswa</span>
                </div>
                <div className="my-3">
                  <p className="text-lg font-extrabold truncate">{studentProfile.nama}</p>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    Kelas {studentProfile.kelas} • {studentProfile.email}
                  </p>
                </div>
                <span className="inline-block w-fit px-3 py-1 rounded-full bg-white/15 text-[11px] font-bold">
                  {predicate.badge} • {predicate.label}
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <TrendingUp size={15} className="text-indigo-600" />
                    Rata-Rata Kumulatif
                  </span>
                  <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    {overallPct}%
                  </span>
                </div>
                <div className="my-2">
                  <p className="text-3xl font-black text-slate-900">
                    {overallAverage.toFixed(2)}{' '}
                    <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Dihitung dari seluruh {submissions.length} kali pengisian
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <ClipboardCheck size={15} className="text-emerald-600" />
                    Total Hari / Entri
                  </span>
                  <Award size={18} className="text-amber-500" />
                </div>
                <div className="my-2">
                  <p className="text-3xl font-black text-slate-900">
                    {submissions.length}{' '}
                    <span className="text-sm font-semibold text-slate-400">Catatan</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Terakhir diisi: {submissions[0].timestamp}
                  </p>
                </div>
              </div>
            </div>

            {/* Radar 7 Dimensi Pribadi + Rekomendasi Action Plan Otomatis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <RadarChart7KAIH
                dimensions={personalDimensions}
                title="Peta Radar 7 Dimensi Pribadi"
                subtitle="Keseimbangan kebiasaan baikmu berdasarkan seluruh riwayat"
              />

              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <h2 className="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2">
                    <Lightbulb size={19} className="text-amber-500 shrink-0" />
                    <span>Rekomendasi Action Plan Harian</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fokus peningkatan otomatis berdasarkan 2 indikator dengan skor terendahmu:
                  </p>

                  <div className="mt-4 space-y-3">
                    {lowestTwoIndicators.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-amber-800">
                            #{item.id} {item.short} ({item.dimension})
                          </span>
                          <span className="text-xs font-black text-amber-700 bg-white px-2.5 py-0.5 rounded-full border border-amber-200">
                            Skor {item.avg.toFixed(2)} / 5.0
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          <strong>Target Aksi:</strong> {item.actionTip}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-800">
                  Konsistensi mengisi setiap hari akan menaikkan level predikat karaktermu menuju{' '}
                  <strong>Master Karakter (Tingkat 4)</strong>.
                </div>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="font-bold text-slate-800 text-base sm:text-lg">
                Rata-Rata Pribadi per Indikator (10 Kebiasaan)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {INDICATOR_DETAILS.map((ind, idx) => {
                  const avg = indicatorAverages[idx] || 0
                  const pct = Math.round((avg / 5) * 100)
                  return (
                    <div key={ind.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-700">
                          {idx + 1}. {ind.short}
                        </span>
                        <span className="font-extrabold text-indigo-700">
                          {avg.toFixed(2)} / 5.0
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2">
                  <Calendar size={18} className="text-indigo-600" />
                  <span>Riwayat Pengisian Harian</span>
                </h2>
                <span className="text-xs font-bold text-slate-400">
                  {submissions.length} Riwayat
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[640px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-400">
                      <th className="py-3 px-3">Waktu Pengisian</th>
                      <th className="py-3 px-3">Rata-Rata</th>
                      <th className="py-3 px-3">Predikat</th>
                      <th className="py-3 px-3">Rincian Skor (1–10)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {submissions.map((sub, i) => {
                      const rowPred = getPredicate(sub.rowAvg)
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-3 font-semibold text-slate-700 whitespace-nowrap">
                            {sub.timestamp}
                            {i === 0 && (
                              <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                                Terbaru
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-black text-indigo-700">
                            {sub.rowAvg.toFixed(2)} / 5.0
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${rowPred.color}`}
                            >
                              {rowPred.label}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1">
                              {sub.scores.map((sc, sIdx) => (
                                <span
                                  key={sIdx}
                                  title={INDICATOR_DETAILS[sIdx]?.short}
                                  className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[11px]"
                                >
                                  {sc}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}