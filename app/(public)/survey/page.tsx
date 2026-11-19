'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  ClipboardList,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  GitMerge,
  Mail,
} from 'lucide-react'

type QuestionItem = {
  id: string
  question_text: string
  category: string
  order_index: number
}

const FALLBACK_QUESTIONS: QuestionItem[] = [
  { id: '1', question_text: 'Saya bangun pagi tepat waktu.', category: '1. Bangun Pagi', order_index: 1 },
  { id: '2', question_text: 'Saya beribadah sesuai keyakinan.', category: '2. Beribadah', order_index: 2 },
  { id: '3', question_text: 'Saya berolahraga secara teratur.', category: '3. Berolahraga', order_index: 3 },
  { id: '4', question_text: 'Saya mengonsumsi makanan sehat dan bergizi.', category: '4. Makan Sehat', order_index: 4 },
  { id: '5', question_text: 'Saya meluangkan waktu untuk membaca.', category: '5. Gemar Membaca', order_index: 5 },
  { id: '6', question_text: 'Saya membantu orang tua dan peduli lingkungan.', category: '6. Bermasyarakat', order_index: 6 },
  { id: '7', question_text: 'Saya beristirahat dengan cukup.', category: '7. Tidur Cepat', order_index: 7 },
  { id: '8', question_text: 'Saya belajar dengan tekun.', category: '5. Gemar Membaca', order_index: 8 },
  { id: '9', question_text: 'Saya berinteraksi dengan baik.', category: '6. Bermasyarakat', order_index: 9 },
  { id: '10', question_text: 'Saya mengatur waktu dengan baik.', category: '1. Bangun Pagi', order_index: 10 },
]

const KELAS_OPTIONS = [
  'X-1', 'X-2', 'X-3', 'X-4', 'X-5', 'X-6', 'X-7', 'X-8', 'X-9', 'X-10', 'X-11', 'X-12',
  'XI-1', 'XI-2', 'XI-3', 'XI-4', 'XI-5', 'XI-6', 'XI-7', 'XI-8', 'XI-9', 'XI-10', 'XI-11', 'XI-12',
  'XII-1', 'XII-2', 'XII-3', 'XII-4', 'XII-5', 'XII-6', 'XII-7', 'XII-8', 'XII-9', 'XII-10', 'XII-11', 'XII-12',
]

const SCALE_LABELS = [
  { val: 1, label: 'Tidak Pernah / Jarang' },
  { val: 2, label: 'Kadang-kadang' },
  { val: 3, label: 'Sering' },
  { val: 4, label: 'Selalu / Rutin' },
]

// Validasi ringan agar siswa tidak mengetik email asal-asalan
function validatePersonalEmail(email: string): string | null {
  const clean = email.trim().toLowerCase()
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/
  if (!emailRegex.test(clean)) {
    return 'Format email pribadi tidak valid. Contoh yang benar: keanu.yusuf@gmail.com'
  }

  const [localPart, domain] = clean.split('@')
  const blockedDomains = [
    'example.com',
    'test.com',
    'mailinator.com',
    'tempmail.com',
    '10minutemail.com',
    'yopmail.com',
    'guerrillamail.com',
    'asdf.com',
    'gmail.con',
    'gmai.com',
  ]
  if (blockedDomains.includes(domain)) {
    return 'Domain email tidak valid atau salah ketik. Gunakan email pribadi aktifmu (contoh: gmail.com).'
  }

  const junkPrefixes = ['tes', 'test', 'asd', 'asdf', 'qwe', '123', '1234', 'abc', 'anon', 'siswa', 'admin', 'dummy', 'fake']
  if (localPart.length < 4 || junkPrefixes.includes(localPart)) {
    return 'Mohon isi dengan alamat email pribadimu yang asli, bukan email percobaan atau asal ketik.'
  }

  return null
}

export default function StudentSurveyPage() {
  const supabase = createClient()
  const router = useRouter()

  const [emailPribadi, setEmailPribadi] = useState<string>('')
  const [nama, setNama] = useState<string>('')
  const [kelas, setKelas] = useState<string>('X-1')
  const [noAbsen, setNoAbsen] = useState<string>('')

  const [questions, setQuestions] = useState<QuestionItem[]>(FALLBACK_QUESTIONS)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<{
    savedEmail: string
    mergedCount: number
  } | null>(null)

  const loadQuestions = useCallback(async () => {
    const { data } = await supabase
      .from('survey_questions')
      .select('*')
      .order('order_index', { ascending: true })

    if (data && data.length > 0) {
      setQuestions(
        data.map((q: Record<string, unknown>, idx: number) => ({
          id: String(q.id || idx + 1),
          question_text: String(q.question_text || q.pertanyaan || ''),
          category: String(q.category || q.kategori || '7 KAIH'),
          order_index: Number(q.order_index ?? idx + 1),
        }))
      )
    }
  }, [supabase])

  useEffect(() => {
    loadQuestions()

    // Isi otomatis email jika siswa kebetulan sedang login
    async function prefillUserEmail() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user?.email) {
        setEmailPribadi(user.email.toLowerCase())
      }
    }
    prefillUserEmail()
  }, [loadQuestions, supabase])

  const handleSubmitSurvey = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const emailValidation = validatePersonalEmail(emailPribadi)
    if (emailValidation) {
      setFormError(emailValidation)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (!nama.trim() || !kelas.trim() || !noAbsen.trim()) {
      setFormError('Lengkapi Nama Lengkap, Kelas, dan Nomor Absen terlebih dahulu.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (Object.keys(answers).length < questions.length) {
      setFormError(`Harap isi seluruh ${questions.length} indikator survei sebelum mengirim.`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setSubmitting(true)
    const cleanEmail = emailPribadi.trim().toLowerCase()

    const orderedScores = questions.map((_, idx) => answers[idx] || 1)
    const payload: Record<string, unknown> = {
      email: cleanEmail,
      nama: nama.trim(),
      kelas: kelas.trim(),
      no_absen: Number(noAbsen) || noAbsen.trim(),
      answers_json: orderedScores,
    }

    orderedScores.forEach((score, idx) => {
      if (idx < 10) {
        payload[`q${idx + 1}`] = score
      }
    })

    const { error: insertError } = await supabase.from('survey_responses').insert([payload])

    if (insertError) {
      setFormError(`Gagal menyimpan survei: ${insertError.message}`)
      setSubmitting(false)
      return
    }

    // Gabungkan otomatis seluruh riwayat lama yang memakai email berbeda berdasarkan Kelas & No. Absen
    let mergedCount = 0
    const { data: mergeRes } = await supabase.rpc('merge_student_survey_history', {
      p_target_email: cleanEmail,
      p_kelas: kelas.trim(),
      p_no_absen: noAbsen.trim(),
      p_nama: nama.trim(),
    })

    if (typeof mergeRes === 'number') {
      mergedCount = mergeRes
    }

    setSubmitting(false)
    setSubmitSuccess({ savedEmail: cleanEmail, mergedCount })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans text-[#090D16]">
      {/* Banner Header Survei */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-950 via-blue-900 to-sky-700 text-white p-6 sm:p-8 shadow-xl border border-amber-300/25">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-extrabold text-amber-300 mb-2">
          <ClipboardList size={13} />
          <span>INSTRUMEN REFLEKSI HARIAN 7 KAIH • SMAN 5 SEMARANG</span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
          Isi Survei Kebiasaan Hebat
        </h1>
        <p className="text-xs sm:text-sm text-sky-100 mt-1">
          Isi identitas dan email pribadimu dengan konsisten agar seluruh riwayat pengisian dari awal otomatis tergabung dalam satu akun.
        </p>
      </div>

      {submitSuccess ? (
        /* === TAMPILAN SUKSES SETELAH KIRIM SURVEI === */
        <div className="kaih-glass-card p-8 rounded-3xl text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 size={30} />
          </div>
          <h2 className="font-heading text-xl font-black text-[#090D16]">
            Survei Berhasil Disimpan!
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 max-w-lg mx-auto">
            Terima kasih <strong>{nama}</strong> ({kelas}, Absen {noAbsen}). Jawabanmu telah dicatat pada email pribadi <strong>{submitSuccess.savedEmail}</strong>.
          </p>

          {submitSuccess.mergedCount > 0 && (
            <div className="p-4 rounded-2xl bg-amber-100/90 border border-amber-300 text-amber-950 text-xs font-extrabold max-w-lg mx-auto flex items-center justify-center gap-2">
              <GitMerge size={16} className="text-amber-700 shrink-0" />
              <span>
                {submitSuccess.mergedCount} riwayat pengisian lamamu atas Kelas {kelas} No. Absen {noAbsen} berhasil digabungkan ke email pribadimu!
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push('/statistik')}
              className="px-6 py-3 rounded-2xl bg-blue-950 text-amber-300 text-xs font-extrabold shadow-md cursor-pointer"
            >
              Lihat Statistik Pribadi Saya
            </button>
            <button
              type="button"
              onClick={() => {
                setSubmitSuccess(null)
                setAnswers({})
              }}
              className="px-5 py-3 rounded-2xl bg-white border border-slate-300 text-xs font-extrabold text-slate-800 cursor-pointer"
            >
              Isi Survei Lagi
            </button>
          </div>
        </div>
      ) : (
        /* === FORMULIR IDENTITAS, EMAIL PRIBADI & 10 INDIKATOR === */
        <form onSubmit={handleSubmitSurvey} className="space-y-5">
          {formError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-sm">
              <AlertCircle size={18} className="text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Identitas & Email Pribadi Siswa */}
          <div className="kaih-glass-card p-6 rounded-3xl space-y-4">
            <div className="border-b border-slate-200/80 pb-3">
              <h2 className="font-heading text-base font-black text-blue-950">
                Data Diri & Email Pribadi Siswa
              </h2>
              <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                Gunakan selalu <strong>email pribadi</strong> yang sama. Jika sebelumnya pernah mengisi memakai email lain, sistem otomatis menggabungkan datamu berdasarkan Kelas dan Nomor Absen.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-6">
                <label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
                  Email Pribadi Siswa *
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={emailPribadi}
                    onChange={(e) => setEmailPribadi(e.target.value)}
                    placeholder="Contoh: keanu.yusuf@gmail.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white/95 text-xs sm:text-sm font-bold text-[#090D16] focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
                  Nama Lengkap Sesuai Absen *
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Keanu Yusuf Al Ghifari"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white/95 text-xs sm:text-sm font-bold text-[#090D16] focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
                  Kelas *
                </label>
                <select
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white/95 text-xs sm:text-sm font-extrabold text-[#090D16] focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {KELAS_OPTIONS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
                  Nomor Absen *
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={noAbsen}
                  onChange={(e) => setNoAbsen(e.target.value)}
                  placeholder="1–36"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white/95 text-xs sm:text-sm font-extrabold text-[#090D16] focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Daftar Pertanyaan Q1 - Q10 */}
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="kaih-glass-card p-5 sm:p-6 rounded-3xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-950 text-amber-300 text-xs font-black">
                    Q{idx + 1}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-950 text-[11px] font-extrabold">
                    {q.category}
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-bold text-[#090D16] leading-relaxed">
                  {q.question_text}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {SCALE_LABELS.map((opt) => {
                    const selected = answers[idx] === opt.val
                    return (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [idx]: opt.val }))}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          selected
                            ? 'bg-gradient-to-r from-blue-900 to-sky-700 text-white border-amber-300 shadow-md'
                            : 'bg-white/85 hover:bg-white text-slate-800 border-slate-200'
                        }`}
                      >
                        <p className={`text-xs font-black ${selected ? 'text-amber-300' : 'text-blue-900'}`}>
                          Skor {opt.val}
                        </p>
                        <p className="text-[11px] font-bold mt-0.5 leading-snug">{opt.label}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-3xl bg-gradient-to-r from-blue-950 via-blue-800 to-sky-600 text-amber-300 text-sm font-extrabold shadow-xl cursor-pointer disabled:opacity-60"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            <span>Kirim Jawaban Survei & Gabungkan Riwayat</span>
          </button>
        </form>
      )}
    </div>
  )
}