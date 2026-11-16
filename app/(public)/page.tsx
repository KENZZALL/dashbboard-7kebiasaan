'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import HeroSection from '@/components/public/HeroSection'
import RadarChart7KAIH from '@/components/public/RadarChart7KAIH'
import { createClient } from '@/lib/supabase/client'
import {
  Search,
  BarChart3,
  UserCheck,
  MousePointerClick,
  Sparkles,
  Flame,
  Trophy,
  Award,
  Zap,
  Lock,
  ArrowUpRight,
  X,
} from 'lucide-react'

const INDICATOR_DETAILS = [
  { short: 'Bangun Pagi', full: 'Saya bangun pagi tepat waktu.' },
  { short: 'Beribadah', full: 'Saya beribadah sesuai keyakinan.' },
  { short: 'Berolahraga', full: 'Saya berolahraga secara teratur.' },
  { short: 'Makan Sehat', full: 'Saya mengonsumsi makanan sehat dan bergizi.' },
  { short: 'Gemar Membaca', full: 'Saya meluangkan waktu untuk membaca.' },
  { short: 'Bermasyarakat', full: 'Saya membantu orang tua dan peduli lingkungan.' },
  { short: 'Tidur Cepat', full: 'Saya beristirahat dengan cukup.' },
  { short: 'Belajar', full: 'Saya belajar dengan tekun.' },
  { short: 'Bersosialisasi', full: 'Saya berinteraksi dengan baik.' },
  { short: 'Mengatur Waktu', full: 'Saya mengatur waktu dengan baik.' },
]

type DashboardAnalytics = {
  completionPct: number
  overallScore: number
  totalResponses: number
  barAverages: number[]
  sevenDimensions: any[]
  userBadge: string
  userStreak: number
  userXp: number
  leaderboard: { name: string; kelas: string; xp: number }[]
}

function processSupabaseRows(rows: any[], email: string | null = null): DashboardAnalytics {
  const scores = (row: any) =>
    Array.from({ length: 10 }, (_, index) => {
      const value = Number(row[`q${index + 1}`])
      return Number.isFinite(value) && value >= 1 && value <= 5 ? value : null
    })
  const allScores = rows.flatMap(scores).filter((value): value is number => value !== null)
  const barAverages = Array.from({ length: 10 }, (_, index) => {
    const values = rows.map((row) => scores(row)[index]).filter((value): value is number => value !== null)
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
  })
  const overallScore = allScores.length
    ? allScores.reduce((sum, value) => sum + value, 0) / allScores.length
    : 0
  const students = new Map<string, { name: string; kelas: string; score: number; count: number }>()
  rows.forEach((row) => {
    const studentKey = String(row.email || row.nama || 'anonim').toLowerCase()
    const values = scores(row).filter((value): value is number => value !== null)
    if (!values.length) return
    const student = students.get(studentKey) || {
      name: row.nama || 'Siswa',
      kelas: row.kelas || '-',
      score: 0,
      count: 0,
    }
    student.score += values.reduce((sum, value) => sum + value, 0) / values.length
    student.count += 1
    students.set(studentKey, student)
  })
  const leaderboard = Array.from(students.values())
    .map((student) => ({
      name: student.name,
      kelas: student.kelas,
      xp: Math.round((student.score / student.count) * 100),
    }))
    .sort((a, b) => b.xp - a.xp)
  const currentStudent = rows.filter(
    (row) => email && String(row.email || '').toLowerCase() === email.toLowerCase()
  )
  const currentScores = currentStudent.flatMap(scores).filter((value): value is number => value !== null)
  const userScore = currentScores.length
    ? currentScores.reduce((sum, value) => sum + value, 0) / currentScores.length
    : 0

  return {
    completionPct: Math.round((overallScore / 5) * 100),
    overallScore,
    totalResponses: rows.length,
    barAverages,
    sevenDimensions: barAverages.slice(0, 7).map((value, index) => ({
      subject: INDICATOR_DETAILS[index].short,
      score: value,
      fullMark: 5,
    })),
    userBadge: userScore >= 4 ? 'Konsisten' : userScore > 0 ? 'Terus Bertumbuh' : 'Penjelajah',
    userStreak: currentStudent.length,
    userXp: Math.round(userScore * 100),
    leaderboard,
  }
}

function getPredicate(score: number) {
  if (score >= 4.5) return { label: 'Sangat Baik', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  if (score >= 3.5) return { label: 'Baik', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
  if (score >= 2.5) return { label: 'Cukup', color: 'bg-amber-50 text-amber-700 border-amber-200' }
  return { label: 'Perlu Ditingkatkan', color: 'bg-rose-50 text-rose-700 border-rose-200' }
}

const GLOBAL_SEARCH_INDEX = [
  {
    title: 'Formulir Yuk Survey! (Evaluasi Harian)',
    category: 'Halaman Survei',
    desc: 'Isi 10 indikator 7 Kebiasaan Anak Indonesia Hebat dengan skala 1–5.',
    href: '/survey',
    keywords: 'survey survei evaluasi isi jawaban harian form kuesioner',
  },
  {
    title: 'Main Game: 7 KAIH Habit Quest',
    category: 'Halaman Game',
    desc: 'Kuis interaktif rotasi 6 jam dengan sistem level, XP, dan profil karakter.',
    href: '/game',
    keywords: 'game kuis main quest xp level karakter',
  },
  {
    title: 'Statistik Pribadi & Rapor Karakter PNG',
    category: 'Halaman Statistik',
    desc: 'Lihat grafik radar pribadi, action plan otomatis, riwayat harian, dan unduh rapor.',
    href: '/statistik',
    keywords: 'statistik pribadi rapor nilai rata-rata radar riwayat unduh png excel',
  },
  {
    title: 'Tentang 7 KAIH & Tim Pengembang Nexara',
    category: 'Halaman Tentang',
    desc: 'Informasi gerakan karakter SMAN 5 Semarang dan profil tim pengembang.',
    href: '/tentang',
    keywords: 'tentang tim pengembang nexara sman 5 semarang profil pembina developer',
  },
  {
    title: '1. Bangun Pagi',
    category: '7 Kebiasaan',
    desc: 'Membiasakan diri bangun tidur sebelum pukul 05.30 pagi setiap hari.',
    href: '/survey',
    keywords: 'bangun pagi 05.30 disiplin subuh',
  },
  {
    title: '2. Beribadah',
    category: '7 Kebiasaan',
    desc: 'Menjalankan ibadah tepat waktu dan berdoa sebelum/sesudah beraktivitas.',
    href: '/survey',
    keywords: 'beribadah ibadah doa agama tepat waktu',
  },
  {
    title: '3. Berolahraga',
    category: '7 Kebiasaan',
    desc: 'Melakukan aktivitas fisik minimal 3 kali seminggu dan aktif di ekstrakurikuler.',
    href: '/survey',
    keywords: 'berolahraga olahraga fisik lari senam ekskul',
  },
  {
    title: '4. Makan Sehat & Bergizi',
    category: '7 Kebiasaan',
    desc: 'Memilih makanan sehat yang mengandung buah, sayur, atau protein.',
    href: '/survey',
    keywords: 'makan sehat bergizi buah sayur protein jajanan',
  },
  {
    title: '5. Gemar Membaca',
    category: '7 Kebiasaan',
    desc: 'Meluangkan waktu membaca buku literasi minimal 15–30 menit setiap hari.',
    href: '/survey',
    keywords: 'gemar membaca literasi buku belajar',
  },
  {
    title: '6. Membantu Orang Tua (Bermasyarakat)',
    category: '7 Kebiasaan',
    desc: 'Membantu pekerjaan rumah tangga dan peduli lingkungan tanpa diperintah.',
    href: '/survey',
    keywords: 'membantu orang tua bermasyarakat gotong royong rumah',
  },
  {
    title: '7. Istirahat Cukup (Tidur Cepat)',
    category: '7 Kebiasaan',
    desc: 'Tidur malam sebelum pukul 22.00 dan bebas gadget menjelang tidur.',
    href: '/survey',
    keywords: 'istirahat cukup tidur cepat gadget malam',
  },
]

function DesktopSidebar({ logoUrl }: { logoUrl: string }) {
  const pathname = usePathname()

  const navItems = [
    { label: 'Beranda', href: '/' },
    { label: 'Yuk Survey!', href: '/survey' },
    { label: 'Main Game', href: '/game' },
    { label: 'Statistik Pribadi', href: '/statistik' },
    { label: 'Tentang 7 KAIH', href: '/tentang' },
    { label: 'Admin', href: '/admin' },
  ]

  return (
    <aside className="w-64 bg-white rounded-3xl shadow-sm border border-slate-100 p-5 hidden lg:flex flex-col shrink-0">
      <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo Nexara"
            className="h-14 w-14 rounded-2xl object-cover bg-slate-950 border border-slate-200 shrink-0 shadow-sm"
          />
        ) : (
          <div className="h-14 w-14 rounded-2xl bg-slate-950 flex items-center justify-center text-white font-black text-base shadow-sm shrink-0">
            NX
          </div>
        )}
        <div>
          <p className="text-base font-extrabold text-slate-800 leading-tight">NEXARA • 7 KAIH</p>
          <p className="text-xs text-slate-500 mt-0.5">SMAN 5 Semarang</p>
        </div>
      </div>

      <nav className="mt-5 space-y-1.5 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`block w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

function InteractiveDonutChart({
  completion,
  overallScore,
  totalResponses,
}: {
  completion: number
  overallScore: number
  totalResponses: number
}) {
  const [showScoreMode, setShowScoreMode] = useState(false)
  const safeCompletion = Math.min(100, Math.max(0, completion))

  return (
    <div
      onClick={() => setShowScoreMode(!showScoreMode)}
      title="Ketuk untuk mengganti tampilan Persentase / Skor Rata-Rata"
      className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all select-none group flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-slate-800 text-base sm:text-lg group-hover:text-indigo-600 transition-colors">
            Progress Kebiasaan
          </h3>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <MousePointerClick size={12} className="text-indigo-500 shrink-0" />
            <span>Ketuk grafik untuk ubah mode</span>
          </p>
        </div>
        <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full shrink-0">
          {showScoreMode ? `${overallScore.toFixed(2)} / 5.0` : `${safeCompletion}%`}
        </span>
      </div>

      <div className="flex items-center justify-center py-3">
        <div className="relative h-40 w-40 transition-transform duration-300 group-hover:scale-105">
          <div className="absolute inset-0 rounded-full bg-slate-100" />
          <div
            className="absolute inset-0 rounded-full transition-all duration-700"
            style={{
              background: `conic-gradient(#4f46e5 0 ${safeCompletion}%, #e2e8f0 ${safeCompletion}% 100%)`,
            }}
          />
          <div className="absolute inset-4 rounded-full bg-white shadow-inner flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                {showScoreMode ? overallScore.toFixed(1) : `${safeCompletion}%`}
              </div>
              <div className="text-[11px] font-semibold text-slate-500">
                {showScoreMode ? 'Skor Skala 5.0' : 'Indeks Tercapai'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mt-2">
        <div className="bg-slate-50 p-3 rounded-2xl">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Total Respon</p>
          <p className="font-bold text-slate-800 text-sm mt-0.5">{totalResponses} Entri</p>
        </div>
        <div className="bg-indigo-50 p-3 rounded-2xl">
          <p className="text-[10px] uppercase tracking-wide text-indigo-500">Status</p>
          <p className="font-bold text-indigo-700 text-sm mt-0.5">Aktif • SMAN 5</p>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const supabase = createClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBarIdx, setSelectedBarIdx] = useState<number>(0)
  const [loadingChart, setLoadingChart] = useState(true)
  const [nexaraLogoUrl, setNexaraLogoUrl] = useState('')
  const [savedStudentEmail, setSavedStudentEmail] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<DashboardAnalytics>(() => processSupabaseRows([]))

  useEffect(() => {
    const email = localStorage.getItem('kaih_student_email')
    if (email) setSavedStudentEmail(email)
  }, [])

  useEffect(() => {
    async function fetchStats() {
      const { data, error } = await supabase
        .from('survey_responses')
        .select('id, nama, kelas, email, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10')

      if (!error && Array.isArray(data)) {
        const email = localStorage.getItem('kaih_student_email')
        setAnalytics(processSupabaseRows(data, email))
      }
      setLoadingChart(false)
    }
    fetchStats()
  }, [])

  const trimmedQuery = searchQuery.trim().toLowerCase()
  const isSearchingAdmin =
    trimmedQuery.includes('admin') ||
    trimmedQuery.includes('panel') ||
    trimmedQuery.includes('database') ||
    trimmedQuery.includes('edit')

  const globalSearchResults = trimmedQuery
    ? GLOBAL_SEARCH_INDEX.filter(
        (item) =>
          item.title.toLowerCase().includes(trimmedQuery) ||
          item.desc.toLowerCase().includes(trimmedQuery) ||
          item.keywords.toLowerCase().includes(trimmedQuery)
      )
    : []

  const selectedAvg = analytics.barAverages[selectedBarIdx] || 0
  const selectedPct = Math.round((selectedAvg / 5) * 100)
  const selectedPredicate = getPredicate(selectedAvg)

  const habits = [
    { title: '1. Bangun Pagi', desc: 'Membiasakan diri bangun tepat waktu untuk memulai hari dengan disiplin.' },
    { title: '2. Beribadah', desc: 'Taat menjalankan ibadah sesuai keyakinan masing-masing.' },
    { title: '3. Berolahraga', desc: 'Menjaga kesehatan dan kebugaran jasmani secara teratur.' },
    { title: '4. Makan Sehat & Bergizi', desc: 'Mengonsumsi makanan yang bernutrisi untuk mendukung tumbuh kembang.' },
    { title: '5. Gemar Membaca', desc: 'Mengembangkan minat baca untuk menambah wawasan dan literasi.' },
    { title: '6. Membantu Orang Tua', desc: 'Aktif berinteraksi, peduli lingkungan, dan bergotong royong.' },
    { title: '7. Istirahat Cukup', desc: 'Menjaga pola tidur yang teratur untuk pemulihan energi fisik dan mental.' },
  ]

  return (
    <div className="flex bg-slate-50 min-h-screen p-3 sm:p-4 gap-6 font-sans">
      <DesktopSidebar logoUrl={nexaraLogoUrl} />

      <main className="flex-1 space-y-5 sm:space-y-6 min-w-0">
        {/* Global Search Bar dengan Proteksi Halaman Admin */}
        <header className="relative bg-white p-3.5 sm:p-4 sm:px-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2.5 bg-slate-100 px-3.5 py-2.5 rounded-xl flex-1 sm:flex-initial sm:w-80 focus-within:ring-2 focus-within:ring-indigo-500">
              <Search size={17} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari survei, kuis, statistik, atau kebiasaan..."
                className="bg-transparent text-sm focus:outline-none w-full text-slate-800"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <div className="hidden md:flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-bold">
                <Sparkles size={14} />
                <span>7 KAIH • SMAN 5 Semarang</span>
              </div>

              {savedStudentEmail && (
                <Link
                  href="/statistik"
                  className="hidden sm:flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-all"
                >
                  <UserCheck size={14} className="text-indigo-600" />
                  <span className="max-w-[140px] truncate">{savedStudentEmail}</span>
                </Link>
              )}

              <Link
                href="/survey"
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-xs font-bold shadow-sm whitespace-nowrap"
              >
                + Isi Survey
              </Link>
            </div>
          </div>

          {/* Dropdown Hasil Pencarian Lintas Halaman */}
          {trimmedQuery && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
              {isSearchingAdmin && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Lock size={16} className="text-amber-600 shrink-0" />
                    <div>
                      <p className="text-xs font-extrabold text-amber-900">
                        Area Panel Admin Terbatas
                      </p>
                      <p className="text-[11px] text-amber-700">
                        Halaman pengelolaan database dan konfigurasi hanya dapat diakses melalui login resmi Admin.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/admin"
                    className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-[11px] font-bold shrink-0"
                  >
                    Login Admin
                  </Link>
                </div>
              )}

              {globalSearchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {globalSearchResults.map((res, idx) => (
                    <Link
                      key={idx}
                      href={res.href}
                      onClick={() => setSearchQuery('')}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/70 hover:border-indigo-300 flex items-start justify-between gap-2 transition-all"
                    >
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-indigo-600">
                          {res.category}
                        </span>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">{res.title}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {res.desc}
                        </p>
                      </div>
                      <ArrowUpRight size={15} className="text-indigo-500 shrink-0 mt-1" />
                    </Link>
                  ))}
                </div>
              ) : (
                !isSearchingAdmin && (
                  <p className="text-xs text-slate-500 py-2 text-center">
                    Tidak ditemukan konten untuk kata kunci <strong>"{searchQuery}"</strong>.
                  </p>
                )
              )}
            </div>
          )}
        </header>

        <Suspense
          fallback={
            <div className="h-[240px] bg-slate-950 rounded-3xl flex items-center justify-center text-white">
              <p className="text-slate-300 animate-pulse font-semibold">Memuat Beranda...</p>
            </div>
          }
        >
          <HeroSection onLogoLoaded={(url: string) => setNexaraLogoUrl(url)} />
        </Suspense>

        {/* BENTO GRID BARIS 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
          <InteractiveDonutChart
            completion={analytics.completionPct}
            overallScore={analytics.overallScore}
            totalResponses={analytics.totalResponses}
          />

          <RadarChart7KAIH dimensions={analytics.sevenDimensions} />

          <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between space-y-4 md:col-span-2 xl:col-span-1">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2">
                  <Trophy size={18} className="text-amber-500 shrink-0" />
                  <span>Pencapaian & Peringkat</span>
                </h3>
                <span className="bg-amber-50 text-amber-700 text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-amber-200">
                  {analytics.userBadge}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-3 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-amber-600 text-[11px] font-bold">
                    <Flame size={14} />
                    <span>Streak Aktif</span>
                  </div>
                  <p className="text-xl font-black text-slate-800 mt-1">
                    {analytics.userStreak}{' '}
                    <span className="text-xs font-semibold text-slate-500">Hari</span>
                  </p>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-3 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-indigo-600 text-[11px] font-bold">
                    <Zap size={14} />
                    <span>Poin XP</span>
                  </div>
                  <p className="text-xl font-black text-indigo-700 mt-1">
                    {analytics.userXp.toLocaleString('id-ID')}{' '}
                    <span className="text-xs font-semibold text-indigo-400">XP</span>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Award size={13} className="text-indigo-500" />
                  <span>Top Siswa Konsisten</span>
                </p>

                {analytics.leaderboard.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-2xl">
                    Belum ada data peringkat siswa.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {analytics.leaderboard.slice(0, 3).map((student, idx) => (
                      <div
                        key={`${student.name}-${idx}`}
                        className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-100"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center shrink-0 ${
                              idx === 0
                                ? 'bg-amber-400 text-white'
                                : idx === 1
                                ? 'bg-slate-400 text-white'
                                : 'bg-orange-400 text-white'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {student.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{student.kelas}</p>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-indigo-600 shrink-0">
                          {student.xp.toLocaleString('id-ID')} XP
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                href="/statistik"
                className="py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs text-center transition-all"
              >
                Statistik Saya
              </Link>
              <Link
                href="/game"
                className="py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs text-center transition-all shadow-xs"
              >
                Main Kuis
              </Link>
            </div>
          </div>
        </div>

        {/* Chart Batang Rata-Rata Jawaban Siswa */}
        <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-5 sm:space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2">
                <BarChart3 size={20} className="text-indigo-600 shrink-0" />
                <span>Chart Batang Rata-Rata Jawaban Siswa</span>
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MousePointerClick size={13} className="text-indigo-500 shrink-0" />
                <span>Ketuk salah satu indikator untuk melihat detail rata-ratanya</span>
              </p>
            </div>
            <span className="bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full">
              Skala 1.0 – 5.0
            </span>
          </div>

          {loadingChart ? (
            <div className="h-48 flex items-center justify-center text-sm text-slate-400 animate-pulse">
              Memuat grafik capaian siswa...
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2.5 sm:hidden border-b border-slate-100 pb-5">
                {analytics.barAverages.map((avg, idx) => {
                  const safeAvg = Math.min(5, Math.max(0, avg))
                  const widthPercent = Math.round((safeAvg / 5) * 100)
                  const isSelected = selectedBarIdx === idx

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedBarIdx(idx)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-indigo-50/90 border-indigo-400 shadow-xs'
                          : 'bg-slate-50/70 border-slate-100 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className={`font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                          {idx + 1}. {INDICATOR_DETAILS[idx].short}
                        </span>
                        <span className={`font-extrabold ${isSelected ? 'text-indigo-700' : 'text-slate-600'}`}>
                          {safeAvg.toFixed(1)}{' '}
                          <span className="text-[10px] font-normal text-slate-400">/ 5.0</span>
                        </span>
                      </div>

                      <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isSelected
                              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500'
                              : 'bg-gradient-to-r from-indigo-500 to-purple-400'
                          }`}
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="hidden sm:grid sm:grid-cols-10 gap-2 items-end h-56 pt-6 px-1 border-b border-slate-100">
                {analytics.barAverages.map((avg, idx) => {
                  const safeAvg = Math.min(5, Math.max(0, avg))
                  const heightPercent = Math.round((safeAvg / 5) * 100)
                  const isSelected = selectedBarIdx === idx

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedBarIdx(idx)}
                      className={`flex flex-col items-center h-full justify-end group p-1.5 rounded-2xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 ring-2 ring-indigo-500 -translate-y-1 shadow-sm'
                          : 'hover:bg-slate-50 hover:-translate-y-0.5'
                      }`}
                    >
                      <span
                        className={`text-xs font-extrabold mb-1.5 transition-transform ${
                          isSelected ? 'text-indigo-700 scale-110' : 'text-slate-600'
                        }`}
                      >
                        {safeAvg.toFixed(1)}
                      </span>
                      <div className="w-full max-w-[30px] bg-slate-100 rounded-t-xl h-36 flex items-end overflow-hidden">
                        <div
                          className={`w-full rounded-t-xl transition-all duration-500 ${
                            isSelected
                              ? 'bg-gradient-to-t from-indigo-700 via-purple-600 to-pink-500'
                              : 'bg-gradient-to-t from-indigo-500 to-purple-400 opacity-80 group-hover:opacity-100'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span
                        className={`text-[10px] text-center mt-2 leading-tight line-clamp-2 h-7 ${
                          isSelected ? 'font-bold text-indigo-700' : 'font-semibold text-slate-500'
                        }`}
                      >
                        {INDICATOR_DETAILS[idx].short}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="bg-slate-50 border border-indigo-100 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-100 px-2.5 py-0.5 rounded-lg">
                      Indikator #{selectedBarIdx + 1} • {INDICATOR_DETAILS[selectedBarIdx].short}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${selectedPredicate.color}`}
                    >
                      {selectedPredicate.label}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed">
                    "{INDICATOR_DETAILS[selectedBarIdx].full}"
                  </p>
                </div>

                <div className="flex items-center justify-around sm:justify-start gap-4 shrink-0 bg-white px-5 py-3.5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Rata-Rata Skor</p>
                    <p className="text-2xl font-black text-indigo-700">
                      {selectedAvg.toFixed(2)}{' '}
                      <span className="text-xs font-semibold text-slate-400">/ 5.0</span>
                    </p>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Persentase</p>
                    <p className="text-2xl font-black text-purple-600">{selectedPct}%</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <section
          id="kebiasaan-section"
          className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100"
        >
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              7 Kebiasaan Anak Indonesia Hebat
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Panduan kebiasaan positif menurut Kementerian Pendidikan Dasar dan Menengah
              (Kemendikdasmen).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits.map((item, idx) => (
              <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <h3 className="text-base font-bold text-indigo-600 mb-1.5">{item.title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}