'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  CheckCircle2,
  ClipboardCheck,
  Sparkles,
  UserCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react'

const SCALE_LABELS: Record<number, string> = {
  1: 'Tidak Pernah',
  2: 'Jarang',
  3: 'Sering',
  4: 'Setiap Saat',
}

type QuestionItem = {
  question_text: string
  category: string
}

const DEFAULT_QUESTIONS: QuestionItem[] = [
  {
    question_text: 'Saya bangun tidur tepat waktu sebelum pukul 05.30 pagi setiap hari.',
    category: '1. Bangun Pagi',
  },
  {
    question_text: 'Saya menjalankan ibadah sesuai agama/kepercayaan saya tepat waktu.',
    category: '2. Beribadah',
  },
  {
    question_text: 'Saya berdoa sebelum dan sesudah melakukan aktivitas harian.',
    category: '2. Beribadah',
  },
  {
    question_text: 'Saya melakukan aktivitas olahraga fisik minimal 3 kali dalam seminggu.',
    category: '3. Berolahraga',
  },
  {
    question_text: 'Saya mengikuti kegiatan ekstrakurikuler atau aktivitas fisik di sekolah.',
    category: '3. Berolahraga',
  },
  {
    question_text: 'Saya mengonsumsi makanan sehat yang mengandung buah, sayur, atau protein.',
    category: '4. Makan Sehat & Bergizi',
  },
  {
    question_text: 'Saya meluangkan waktu untuk membaca buku literasi minimal 15–30 menit per hari.',
    category: '5. Gemar Membaca',
  },
  {
    question_text: 'Saya membantu pekerjaan rumah tangga orang tua tanpa harus diperintah.',
    category: '6. Bermasyarakat',
  },
  {
    question_text: 'Saya tidur malam tepat waktu sebelum pukul 22.00 agar istirahat tercukupi.',
    category: '7. Tidur Cepat',
  },
  {
    question_text: 'Saya tidak bermain HP/gadget secara berlebihan menjelang waktu tidur.',
    category: '7. Tidur Cepat',
  },
]

const KELAS_OPTIONS = [
  ...Array.from({ length: 12 }, (_, i) => `X-${i + 1}`),
  ...Array.from({ length: 12 }, (_, i) => `XI-${i + 1}`),
  ...Array.from({ length: 12 }, (_, i) => `XII-${i + 1}`),
]

const ABSEN_OPTIONS = Array.from({ length: 40 }, (_, i) => i + 1)
const SESSION_VAULT_KEY = 'kaih_active_tab_drafts_v1'

function SurveyFormContent() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  const quizResultId = searchParams.get('result_id')
  const quizProfile = searchParams.get('profile')

  // Identitas selalu bersih saat membuka link baru
  const [nama, setNama] = useState('')
  const [kelas, setKelas] = useState('')
  const [noAbsen, setNoAbsen] = useState('')
  const [email, setEmail] = useState('')
  const [autoFillInfo, setAutoFillInfo] = useState<string | null>(null)
  const [checkingEmail, setCheckingEmail] = useState(false)

  const [questions, setQuestions] = useState<QuestionItem[]>(DEFAULT_QUESTIONS)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Saat link baru dibuka: hapus jejak identitas lintas-tab di localStorage agar selalu mulai kosong
  useEffect(() => {
    try {
      localStorage.removeItem('kaih_student_name')
      localStorage.removeItem('kaih_student_class')
      localStorage.removeItem('kaih_student_absen')
      localStorage.removeItem('kaih_student_email')
    } catch {}
  }, [])

  // Simpan draft pengisian per-email di sessionStorage (aktif selama tab/website belum ditutup)
  useEffect(() => {
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes('@')) return

    try {
      const raw = sessionStorage.getItem(SESSION_VAULT_KEY)
      const vault = raw ? JSON.parse(raw) : {}
      vault[cleanEmail] = {
        nama,
        kelas,
        noAbsen,
        answers,
      }
      sessionStorage.setItem(SESSION_VAULT_KEY, JSON.stringify(vault))
    } catch {}
  }, [email, nama, kelas, noAbsen, answers])

  // Muat daftar pertanyaan dinamis beserta kategori 7 KAIH dari Supabase
  useEffect(() => {
    async function loadQuestions() {
      const { data } = await supabase
        .from('survey_questions')
        .select('question_text, category, order_index')
        .order('order_index', { ascending: true })

      if (data && data.length > 0) {
        setQuestions(
          data.map((q) => ({
            question_text: q.question_text,
            category: q.category || '1. Bangun Pagi',
          }))
        )
      }
    }
    loadQuestions()
  }, [])

  // Pulihkan identitas & jawaban saat email dimasukkan kembali selama website belum tertutup
  const handleEmailChangeAndRestore = async (rawEmail: string) => {
    setEmail(rawEmail)
    const cleanEmail = rawEmail.trim().toLowerCase()

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAutoFillInfo(null)
      return
    }

    // 1. Cek sessionStorage tab aktif terlebih dahulu (jika siswa mengganti/menghapus email lalu mengetikkan email sebelumnya sebelum tab ditutup)
    try {
      const raw = sessionStorage.getItem(SESSION_VAULT_KEY)
      if (raw) {
        const vault = JSON.parse(raw)
        const cached = vault[cleanEmail]
        if (cached) {
          if (cached.nama) setNama(cached.nama)
          if (cached.kelas) setKelas(cached.kelas)
          if (cached.noAbsen) setNoAbsen(cached.noAbsen)
          if (cached.answers && Object.keys(cached.answers).length > 0) {
            setAnswers(cached.answers)
          }
          setAutoFillInfo(
            `Sesi pengisian untuk ${cached.nama || cleanEmail} dipulihkan otomatis beserta jawaban yang sudah diisi.`
          )
          return
        }
      }
    } catch {}

    // 2. Jika belum ada di draft tab ini, cek riwayat identitas di Supabase
    setCheckingEmail(true)
    const { data } = await supabase
      .from('survey_responses')
      .select('nama, kelas, no_absen, created_at')
      .ilike('email', cleanEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data) {
      if (data.nama) setNama(data.nama)
      if (data.kelas) setKelas(data.kelas)
      if (data.no_absen) setNoAbsen(String(data.no_absen))
      setAutoFillInfo(
        `Identitas ditemukan: ${data.nama} (${data.kelas}${
          data.no_absen ? ` • Absen ${data.no_absen}` : ''
        }).`
      )
    } else {
      setAutoFillInfo(null)
    }
    setCheckingEmail(false)
  }

  const totalQuestions = questions.length
  const answeredCount = questions.reduce(
    (acc, _, idx) => (answers[idx] !== undefined ? acc + 1 : acc),
    0
  )
  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0

  const handleSelectScore = (qIndex: number, val: number) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!nama.trim() || !kelas || !noAbsen || !email.trim()) {
      setErrorMsg('Harap lengkapi Email Aktif, Nama Lengkap, Kelas, dan Nomor Absen.')
      return
    }

    if (answeredCount < totalQuestions) {
      setErrorMsg(
        `Baru ${answeredCount} dari ${totalQuestions} indikator yang terisi. Lengkapi semua terlebih dahulu.`
      )
      return
    }

    setSubmitting(true)

    const scores = Array.from({ length: totalQuestions }, (_, idx) => Number(answers[idx]) || 0)
    const rataRata =
      totalQuestions > 0
        ? Number((scores.reduce((a, b) => a + b, 0) / totalQuestions).toFixed(2))
        : 0
    const cleanEmail = email.trim().toLowerCase()

    const payload: Record<string, any> = {
      nama: nama.trim(),
      kelas,
      no_absen: Number(noAbsen),
      email: cleanEmail,
      q1: scores[0] || 0,
      q2: scores[1] || 0,
      q3: scores[2] || 0,
      q4: scores[3] || 0,
      q5: scores[4] || 0,
      q6: scores[5] || 0,
      q7: scores[6] || 0,
      q8: scores[7] || 0,
      q9: scores[8] || 0,
      q10: scores[9] || 0,
      answers_json: scores,
      rata_rata: rataRata,
    }

    if (quizResultId) payload.quiz_result_id = quizResultId
    if (quizProfile) payload.quiz_profile = quizProfile

    const { error } = await supabase.from('survey_responses').insert([payload])

    setSubmitting(false)

    if (error) {
      setErrorMsg(`Gagal menyimpan survei: ${error.message}`)
      return
    }

    router.push(`/statistik?email=${encodeURIComponent(cleanEmail)}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-3 sm:px-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Banner Header */}
        <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-md space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-bold">
            <Sparkles size={14} className="text-amber-300" />
            <span>Evaluasi Harian • 7 KAIH (Skala 1–4)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Survei Kebiasaan Anak Indonesia Hebat
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
            Isilah dengan jujur sesuai aktivitas kalian hari ini (1 = Tidak Pernah, 2 = Jarang, 3 =
            Sering, 4 = Setiap Saat).
          </p>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-bold text-indigo-100">
              <span>Progres Pengisian Indikator</span>
              <span>
                {answeredCount} / {totalQuestions} Terisi
              </span>
            </div>
            <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form Identitas Siswa */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <ClipboardCheck size={20} className="text-indigo-600" />
                <span>Identitas Siswa</span>
              </h2>
              <span className="text-[11px] font-semibold text-slate-400">
                Link baru dimulai bersih
              </span>
            </div>

            {/* Email Aktif */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1.5">
                Email Aktif Siswa
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => handleEmailChangeAndRestore(e.target.value)}
                  placeholder="contoh: nama.siswa@sma.belajar.id"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                {checkingEmail && (
                  <Loader2
                    size={16}
                    className="animate-spin text-indigo-600 absolute right-4 top-1/2 -translate-y-1/2"
                  />
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Masukkan kembali emailmu selama halaman belum ditutup untuk memulihkan identitas &
                isian sebelumnya.
              </p>

              {autoFillInfo && (
                <div className="mt-2.5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2">
                  <UserCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>{autoFillInfo}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Nama Lengkap */}
              <div className="sm:col-span-6">
                <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1.5">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Dropdown Bergulir Kelas X-1 s.d. XII-12 */}
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1.5">
                  Kelas
                </label>
                <select
                  required
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="">Pilih Kelas</option>
                  <optgroup label="Kelas X">
                    {KELAS_OPTIONS.filter((c) => c.startsWith('X-')).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Kelas XI">
                    {KELAS_OPTIONS.filter((c) => c.startsWith('XI-')).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Kelas XII">
                    {KELAS_OPTIONS.filter((c) => c.startsWith('XII-')).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Dropdown Bergulir No. Absen 1 s.d. 40 */}
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1.5">
                  No. Absen
                </label>
                <select
                  required
                  value={noAbsen}
                  onChange={(e) => setNoAbsen(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="">Pilih Absen</option>
                  {ABSEN_OPTIONS.map((num) => (
                    <option key={num} value={num}>
                      Absen {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Indikator Pertanyaan Skala 1 - 4 */}
          <div className="space-y-4">
            {questions.map((item, idx) => {
              const selectedVal = answers[idx]
              return (
                <div
                  key={idx}
                  className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4"
                >
                  <div className="space-y-1.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider">
                      {item.category}
                    </span>
                    <div className="flex items-start gap-3">
                      <span className="h-7 w-7 rounded-xl bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed">
                        {item.question_text}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[1, 2, 3, 4].map((score) => {
                      const active = selectedVal === score
                      return (
                        <button
                          key={score}
                          type="button"
                          onClick={() => handleSelectScore(idx, score)}
                          className={`py-3 px-2 rounded-2xl border text-center transition-all cursor-pointer ${
                            active
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm scale-[1.02]'
                              : 'bg-slate-50 border-slate-200/80 hover:border-indigo-300 text-slate-700'
                          }`}
                        >
                          <div className="text-base sm:text-lg font-black">{score}</div>
                          <div
                            className={`text-[11px] font-bold mt-0.5 leading-tight ${
                              active ? 'text-indigo-100' : 'text-slate-500'
                            }`}
                          >
                            {SCALE_LABELS[score]}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 disabled:opacity-60 text-white font-extrabold text-sm sm:text-base shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 size={18} />
            <span>
              {submitting ? 'Menyimpan Jawaban...' : 'Kirim Jawaban Survei & Lihat Statistik'}
            </span>
          </button>
        </form>
      </div>
    </div>
  )
}

export default function SurveyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
          Memuat formulir survei...
        </div>
      }
    >
      <SurveyFormContent />
    </Suspense>
  )
}