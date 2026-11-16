'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Save,
  RotateCcw,
  CheckCircle2,
  FileEdit,
  AlertCircle,
  Plus,
  Trash2,
  Tag,
} from 'lucide-react'

export const KAIH_CATEGORIES = [
  '1. Bangun Pagi',
  '2. Beribadah',
  '3. Berolahraga',
  '4. Makan Sehat & Bergizi',
  '5. Gemar Membaca',
  '6. Bermasyarakat',
  '7. Tidur Cepat',
]

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

export default function AdminEditSurveyQuestionPage() {
  const supabase = createClient()
  const [questions, setQuestions] = useState<QuestionItem[]>(DEFAULT_QUESTIONS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    async function loadQuestions() {
      setLoading(true)
      const { data, error } = await supabase
        .from('survey_questions')
        .select('question_text, category, order_index')
        .order('order_index', { ascending: true })

      if (!error && data && data.length > 0) {
        setQuestions(
          data.map((item) => ({
            question_text: item.question_text,
            category: item.category || '1. Bangun Pagi',
          }))
        )
      }
      setLoading(false)
    }
    loadQuestions()
  }, [])

  const handleChangeText = (idx: number, val: string) => {
    setQuestions((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, question_text: val } : item))
    )
  }

  const handleChangeCategory = (idx: number, category: string) => {
    setQuestions((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, category } : item))
    )
  }

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question_text: '',
        category: KAIH_CATEGORIES[0],
      },
    ])
  }

  const handleDeleteQuestion = (idx: number) => {
    if (questions.length <= 1) {
      setStatusMsg({ type: 'err', text: 'Minimal harus tersisa 1 pertanyaan survei.' })
      return
    }
    setQuestions((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleResetDefault = () => {
    if (!confirm('Kembalikan ke 10 pertanyaan bawaan 7 KAIH?')) return
    setQuestions(DEFAULT_QUESTIONS)
    setStatusMsg({
      type: 'ok',
      text: 'Teks dikembalikan ke bawaan. Klik "Simpan Pertanyaan" untuk menerapkan ke database.',
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMsg(null)

    if (questions.some((q) => !q.question_text.trim())) {
      setStatusMsg({ type: 'err', text: 'Semua kolom pertanyaan wajib diisi teksnya.' })
      return
    }

    setSaving(true)

    // 1. Hapus semua baris lama di survey_questions
    const { error: delError } = await supabase
      .from('survey_questions')
      .delete()
      .gte('order_index', 0)

    if (delError) {
      setSaving(false)
      setStatusMsg({
        type: 'err',
        text: `Gagal menghapus data lama: ${delError.message}`,
      })
      return
    }

    // 2. Simpan daftar soal & kategori baru
    const nowIso = new Date().toISOString()
    const payload = questions.map((item, idx) => ({
      order_index: idx + 1,
      question_text: item.question_text.trim(),
      category: item.category,
      updated_at: nowIso,
    }))

    const { data: insertedData, error: insError } = await supabase
      .from('survey_questions')
      .insert(payload)
      .select()

    setSaving(false)

    if (insError) {
      setStatusMsg({
        type: 'err',
        text: `Gagal menyimpan ke database: ${insError.message}`,
      })
      return
    }

    setStatusMsg({
      type: 'ok',
      text: `Tersimpan (${insertedData?.length || questions.length} soal)! Perubahan sudah sinkron dengan halaman publik Yuk Survey.`,
    })
  }

  return (
    <div className="p-4 sm:p-8 lg:p-10 space-y-6 font-sans max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 mb-2"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Dashboard Admin</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <FileEdit size={26} className="text-indigo-600" />
            <span>Edit Pertanyaan Survey</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tambah, hapus, ubah teks indikator, dan tentukan kategori 7 KAIH ({questions.length} soal
            aktif).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAddQuestion}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus size={15} />
            <span>Tambah Soal</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefault}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Reset Bawaan</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            statusMsg.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          {statusMsg.type === 'ok' ? (
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {loading ? (
          <div className="bg-white p-10 rounded-3xl border border-slate-200/80 text-center text-sm text-slate-400 animate-pulse">
            Memuat daftar pertanyaan dari Supabase...
          </div>
        ) : (
          questions.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">
                  Indikator Pertanyaan #{idx + 1}
                </span>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200/70 px-2.5 py-1 rounded-xl">
                    <Tag size={12} className="text-indigo-600 shrink-0" />
                    <select
                      value={item.category}
                      onChange={(e) => handleChangeCategory(idx, e.target.value)}
                      className="bg-transparent text-xs font-bold text-indigo-800 focus:outline-none cursor-pointer"
                    >
                      {KAIH_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(idx)}
                    title="Hapus pertanyaan ini"
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <textarea
                rows={2}
                required
                placeholder="Tulis teks pertanyaan survei..."
                value={item.question_text}
                onChange={(e) => handleChangeText(idx, e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          ))
        )}

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleAddQuestion}
            className="px-4 py-3 rounded-2xl border-2 border-dashed border-indigo-300 hover:bg-indigo-50 text-indigo-700 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} />
            <span>+ Tambah Pertanyaan Baru</span>
          </button>

          <button
            type="submit"
            disabled={saving || loading}
            className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-extrabold flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Save size={16} />
            <span>{saving ? 'Menyimpan...' : `Simpan ${questions.length} Pertanyaan`}</span>
          </button>
        </div>
      </form>
    </div>
  )
}