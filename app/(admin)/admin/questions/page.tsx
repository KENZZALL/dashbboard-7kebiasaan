'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  ClipboardEdit,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Loader2,
} from 'lucide-react'

type QuestionRow = {
  id: string
  question_code: string
  question_text: string
  category: string
  order_index: number
  rawColumns: string[]
}

const HABIT_CATEGORIES = [
  '1. Bangun Pagi',
  '2. Beribadah',
  '3. Berolahraga',
  '4. Makan Sehat',
  '5. Gemar Membaca',
  '6. Bermasyarakat',
  '7. Tidur Cepat',
  'Bangun Pagi',
  'Beribadah',
  'Berolahraga',
  'Makan Sehat',
  'Gemar Membaca',
  'Bermasyarakat',
  'Tidur Cepat',
]

const DEFAULT_10_QUESTIONS = [
  { question_text: 'Saya bangun pagi tepat waktu.', category: '1. Bangun Pagi', order_index: 1 },
  { question_text: 'Saya beribadah sesuai keyakinan.', category: '2. Beribadah', order_index: 2 },
  { question_text: 'Saya berolahraga secara teratur.', category: '3. Berolahraga', order_index: 3 },
  { question_text: 'Saya mengonsumsi makanan sehat dan bergizi.', category: '4. Makan Sehat', order_index: 4 },
  { question_text: 'Saya meluangkan waktu untuk membaca.', category: '5. Gemar Membaca', order_index: 5 },
  { question_text: 'Saya membantu orang tua dan peduli lingkungan.', category: '6. Bermasyarakat', order_index: 6 },
  { question_text: 'Saya beristirahat dengan cukup.', category: '7. Tidur Cepat', order_index: 7 },
  { question_text: 'Saya belajar dengan tekun.', category: '5. Gemar Membaca', order_index: 8 },
  { question_text: 'Saya berinteraksi dengan baik.', category: '6. Bermasyarakat', order_index: 9 },
  { question_text: 'Saya mengatur waktu dengan baik.', category: '1. Bangun Pagi', order_index: 10 },
]

export default function AdminQuestionsPage() {
  const supabase = createClient()

  const [questions, setQuestions] = useState<QuestionRow[]>([])
  const [tableColumns, setTableColumns] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const editingIdRef = useRef<string | null>(null)
  editingIdRef.current = editingId

  const [codeInput, setCodeInput] = useState<string>('Q1')
  const [categoryInput, setCategoryInput] = useState<string>('1. Bangun Pagi')
  const [textInput, setTextInput] = useState<string>('')
  const [orderInput, setOrderInput] = useState<number>(1)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  const fetchQuestions = useCallback(async () => {
    setLoading(true)

    let { data, error } = await supabase
      .from('survey_questions')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      const fallbackRes = await supabase.from('survey_questions').select('*')
      data = fallbackRes.data
      error = fallbackRes.error
    }

    if (!error && data) {
      if (data.length > 0) {
        setTableColumns(Object.keys(data[0]))
      }

      const normalized: QuestionRow[] = data
        .map((row: Record<string, unknown>, idx: number) => {
          const cols = Object.keys(row)
          const orderVal = Number(row.order_index ?? row.urutan ?? idx + 1)
          return {
            id: String(row.id),
            question_code: String(row.question_code || row.code || `Q${orderVal}`),
            question_text: String(row.question_text || row.text || row.pertanyaan || ''),
            category: String(row.category || row.kategori || '1. Bangun Pagi'),
            order_index: orderVal,
            rawColumns: cols,
          }
        })
        .sort((a, b) => a.order_index - b.order_index)

      setQuestions(normalized)

      if (!editingIdRef.current) {
        const nextNum = normalized.length + 1
        setCodeInput(`Q${nextNum}`)
        setOrderInput(nextNum)
      }
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchQuestions()

    const channel = supabase
      .channel('realtime-admin-questions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'survey_questions' },
        () => fetchQuestions()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchQuestions, supabase])

  const resetForm = (nextCount = questions.length + 1) => {
    setEditingId(null)
    setCodeInput(`Q${nextCount}`)
    setCategoryInput('1. Bangun Pagi')
    setTextInput('')
    setOrderInput(nextCount)
  }

  const handleEditClick = (q: QuestionRow) => {
    setEditingId(q.id)
    setCodeInput(q.question_code)
    setCategoryInput(q.category)
    setTextInput(q.question_text)
    setOrderInput(q.order_index)
  }

  // Membangun payload yang 100% sesuai kolom aktual di tabel survey_questions Supabase
  const buildAdaptivePayload = () => {
    const cols = tableColumns
    const payload: Record<string, unknown> = {}

    if (cols.length === 0) {
      return {
        question_text: textInput.trim(),
        category: categoryInput.trim() || '1. Bangun Pagi',
        order_index: Number(orderInput) || 1,
      }
    }

    if (cols.includes('question_code')) payload.question_code = codeInput.trim()
    else if (cols.includes('code')) payload.code = codeInput.trim()

    if (cols.includes('question_text')) payload.question_text = textInput.trim()
    else if (cols.includes('pertanyaan')) payload.pertanyaan = textInput.trim()
    else if (cols.includes('text')) payload.text = textInput.trim()

    if (cols.includes('category')) payload.category = categoryInput.trim()
    else if (cols.includes('kategori')) payload.kategori = categoryInput.trim()

    if (cols.includes('order_index')) payload.order_index = Number(orderInput) || 1
    else if (cols.includes('urutan')) payload.urutan = Number(orderInput) || 1

    return payload
  }

  const handleSeedDefaults = async () => {
    setSaving(true)
    const { error } = await supabase.from('survey_questions').insert(DEFAULT_10_QUESTIONS)
    if (error) {
      alert(`Gagal mengisi 10 indikator bawaan: ${error.message}`)
    } else {
      await fetchQuestions()
      showToast('10 indikator survei bawaan berhasil ditambahkan!')
    }
    setSaving(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!textInput.trim()) return

    setSaving(true)
    const payload = buildAdaptivePayload()

    if (editingId) {
      const { error } = await supabase
        .from('survey_questions')
        .update(payload)
        .eq('id', editingId)

      if (error) {
        alert(`Gagal memperbarui pertanyaan: ${error.message}`)
      } else {
        await fetchQuestions()
        resetForm(questions.length + 1)
        showToast('Perubahan pertanyaan survei berhasil disimpan!')
      }
    } else {
      const { error } = await supabase.from('survey_questions').insert([payload])

      if (error) {
        alert(`Gagal menambahkan pertanyaan: ${error.message}`)
      } else {
        await fetchQuestions()
        resetForm(questions.length + 2)
        showToast('Pertanyaan survei baru berhasil ditambahkan!')
      }
    }

    setSaving(false)
  }

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Hapus pertanyaan indikator "${code}" dari survei?`)) return
    const { error } = await supabase.from('survey_questions').delete().eq('id', id)
    if (error) {
      alert(`Gagal menghapus pertanyaan: ${error.message}`)
    } else {
      if (editingId === id) resetForm(questions.length)
      await fetchQuestions()
      showToast(`Pertanyaan ${code} berhasil dihapus.`)
    }
  }

  const categoryOptions = Array.from(
    new Set([categoryInput, ...HABIT_CATEGORIES].filter(Boolean))
  )

  return (
    <div className="space-y-6 font-sans text-[#090D16]">
      {/* Banner Header */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-950 via-blue-900 to-sky-700 text-white p-6 sm:p-8 shadow-xl border border-amber-300/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-extrabold text-amber-300 mb-2">
            <ClipboardEdit size={13} />
            <span>MANAJEMEN INDIKATOR & BUTIR SURVEI</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
            Kelola Pertanyaan Survei
          </h1>
          <p className="text-xs sm:text-sm text-sky-100 mt-1">
            Tambah, ubah redaksi pernyataan indikator, serta atur kategori 7 Kebiasaan Anak Indonesia Hebat secara real-time.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchQuestions}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-xs font-extrabold text-white shrink-0 cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Segarkan Daftar</span>
        </button>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-sm">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* === KOLOM KIRI: FORM TAMBAH / EDIT PERTANYAAN === */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 kaih-glass-card p-6 rounded-3xl space-y-4 self-start"
        >
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <h2 className="font-heading text-base font-black text-blue-950">
              {editingId ? `Edit Indikator (${codeInput})` : 'Tambah Pertanyaan Baru'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={() => resetForm(questions.length + 1)}
                className="inline-flex items-center gap-1 text-xs font-extrabold text-rose-600 hover:underline cursor-pointer"
              >
                <X size={14} />
                <span>Batal</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
                Kode Indikator
              </label>
              <input
                type="text"
                required
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="Contoh: Q1"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white/90 text-xs font-extrabold text-[#090D16] focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
                Nomor Urut
              </label>
              <input
                type="number"
                min={1}
                required
                value={orderInput}
                onChange={(e) => setOrderInput(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white/90 text-xs font-extrabold text-[#090D16] focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
              Kategori Dimensi 7 KAIH
            </label>
            <select
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white/90 text-xs font-extrabold text-[#090D16] focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
              Teks Pernyataan / Pertanyaan Survei *
            </label>
            <textarea
              rows={3}
              required
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Contoh: Saya bangun pagi tepat waktu sebelum pukul 05.30 WIB."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white/90 text-xs sm:text-sm font-medium text-[#090D16] focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-sky-600 hover:opacity-95 text-amber-300 text-xs font-extrabold shadow-md cursor-pointer disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : editingId ? (
              <Save size={15} />
            ) : (
              <Plus size={15} />
            )}
            <span>{editingId ? 'Simpan Perubahan Indikator' : 'Tambahkan Pertanyaan'}</span>
          </button>
        </form>

        {/* === KOLOM KANAN: DAFTAR PERTANYAAN SURVEI === */}
        <div className="lg:col-span-7 space-y-3">
          {loading ? (
            <div className="kaih-glass-card p-10 rounded-3xl text-center text-xs font-bold text-slate-600 animate-pulse">
              Memuat daftar pertanyaan dari database Supabase...
            </div>
          ) : questions.length === 0 ? (
            <div className="kaih-glass-card p-8 rounded-3xl text-center space-y-4">
              <div className="space-y-1">
                <p className="font-heading text-base font-black text-[#090D16]">
                  Belum Ada Pertanyaan di Tabel survey_questions
                </p>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Kamu dapat menambahkan pertanyaan satu per satu melalui formulir di samping, atau isi otomatis 10 indikator standar 7 KAIH.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSeedDefaults}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-amber-300 text-xs font-extrabold shadow-md cursor-pointer"
              >
                <Sparkles size={15} />
                <span>Isi Otomatis 10 Indikator Standar 7 KAIH</span>
              </button>
            </div>
          ) : (
            questions.map((q) => (
              <div
                key={q.id}
                className={`kaih-glass-card p-5 rounded-3xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  editingId === q.id ? 'ring-2 ring-blue-700 bg-white/95' : ''
                }`}
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-950 text-amber-300 text-[11px] font-black">
                      {q.question_code}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-950 border border-amber-300/70 text-[11px] font-extrabold">
                      {q.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      Urutan #{q.order_index}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-[#090D16] leading-relaxed">
                    {q.question_text}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleEditClick(q)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/90 hover:bg-blue-50 border border-slate-300 text-xs font-extrabold text-blue-900 cursor-pointer"
                  >
                    <Pencil size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(q.id, q.question_code)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/90 hover:bg-rose-50 border border-slate-300 text-xs font-extrabold text-rose-700 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}