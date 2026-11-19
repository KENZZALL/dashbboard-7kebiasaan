'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  CheckCircle2,
  Loader2,
  SlidersHorizontal,
  Sunrise,
  HeartHandshake,
  Dumbbell,
  Apple,
  BookOpenCheck,
  Users,
  MoonStar,
} from 'lucide-react'

type SurveyQuestionRow = {
  id: string
  order_index: number
  question_text: string
  category: string
}

const SEVEN_KAIH_CATEGORIES = [
  {
    value: 'Bangun Pagi',
    label: '01 • Bangun Pagi',
    badge: 'bg-amber-100 text-amber-900 border-amber-300',
    icon: Sunrise,
  },
  {
    value: 'Beribadah',
    label: '02 • Beribadah',
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    icon: HeartHandshake,
  },
  {
    value: 'Berolahraga',
    label: '03 • Berolahraga',
    badge: 'bg-sky-100 text-sky-900 border-sky-300',
    icon: Dumbbell,
  },
  {
    value: 'Makan Sehat',
    label: '04 • Makan Sehat & Bergizi',
    badge: 'bg-rose-100 text-rose-900 border-rose-300',
    icon: Apple,
  },
  {
    value: 'Gemar Membaca',
    label: '05 • Gemar Membaca',
    badge: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    icon: BookOpenCheck,
  },
  {
    value: 'Bermasyarakat',
    label: '06 • Bermasyarakat & Membantu Orang Tua',
    badge: 'bg-orange-100 text-orange-900 border-orange-300',
    icon: Users,
  },
  {
    value: 'Tidur Cepat',
    label: '07 • Tidur Cepat & Istirahat Cukup',
    badge: 'bg-violet-100 text-violet-900 border-violet-300',
    icon: MoonStar,
  },
]

const FIXED_SCALE_OPTIONS = [
  { score: 1, label: 'Tidak Pernah' },
  { score: 2, label: 'Kadang-kadang' },
  { score: 3, label: 'Sering' },
  { score: 4, label: 'Selalu' },
]

export default function KelolaPertanyaanSurveiPage() {
  const supabase = createClient()
  const [questions, setQuestions] = useState<SurveyQuestionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState('')

  // Form Tambah / Edit Pertanyaan
  const [editingId, setEditingId] = useState<string | null>(null)
  const [orderIndex, setOrderIndex] = useState<number>(1)
  const [questionText, setQuestionText] = useState('')
  const [category, setCategory] = useState<string>('Bangun Pagi')

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3500)
  }

  const fetchSurveyQuestions = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('survey_questions')
      .select('id, order_index, question_text, category')
      .order('order_index', { ascending: true })

    if (!error && data) {
      setQuestions(data as SurveyQuestionRow[])
      if (!editingId) {
        setOrderIndex(data.length + 1)
      }
    }
    setLoading(false)
  }, [supabase, editingId])

  useEffect(() => {
    fetchSurveyQuestions()
  }, [fetchSurveyQuestions])

  const resetForm = () => {
    setEditingId(null)
    setOrderIndex(questions.length + 1)
    setQuestionText('')
    setCategory('Bangun Pagi')
  }

  const handleEditClick = (row: SurveyQuestionRow) => {
    setEditingId(row.id)
    setOrderIndex(Number(row.order_index) || 1)
    setQuestionText(row.question_text || '')
    setCategory(row.category || 'Bangun Pagi')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionText.trim()) {
      alert('Teks pertanyaan survei tidak boleh kosong.')
      return
    }

    setSaving(true)
    const payload = {
      order_index: Number(orderIndex),
      question_text: questionText.trim(),
      category,
    }

    if (editingId) {
      const { error } = await supabase
        .from('survey_questions')
        .update(payload)
        .eq('id', editingId)

      if (error) {
        alert(`Gagal memperbarui pertanyaan: ${error.message}`)
      } else {
        showToast('Pertanyaan survei & kategori 7 KAIH berhasil diperbarui!')
        resetForm()
        fetchSurveyQuestions()
      }
    } else {
      const { error } = await supabase.from('survey_questions').insert([payload])
      if (error) {
        alert(`Gagal menambah pertanyaan: ${error.message}`)
      } else {
        showToast('Pertanyaan survei baru berhasil ditambahkan!')
        resetForm()
        fetchSurveyQuestions()
      }
    }
    setSaving(false)
  }

  // Ubah Kategori 7 KAIH secara instan dari daftar pertanyaan
  const handleQuickCategoryChange = async (id: string, newCategory: string) => {
    setUpdatingId(id)
    const { error } = await supabase
      .from('survey_questions')
      .update({ category: newCategory })
      .eq('id', id)

    if (!error) {
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, category: newCategory } : q))
      )
      showToast(`Kategori pertanyaan berhasil diubah ke "${newCategory}".`)
    } else {
      alert(`Gagal mengubah kategori: ${error.message}`)
    }
    setUpdatingId(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pertanyaan survei ini dari formulir?')) return
    const { error } = await supabase.from('survey_questions').delete().eq('id', id)
    if (!error) {
      showToast('Pertanyaan survei berhasil dihapus.')
      if (editingId === id) resetForm()
      fetchSurveyQuestions()
    }
  }

  return (
    <div className="space-y-6 font-sans text-[#090D16]">
      {/* Banner Header */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-800 to-sky-700 text-white p-6 sm:p-8 shadow-xl border border-indigo-400/20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-extrabold text-sky-200 mb-2">
          <ClipboardList size={13} />
          <span>MANAJEMEN INDIKATOR & KATEGORI • 7 KAIH</span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
          Kelola Pertanyaan Survei & Kategori 7 KAIH
        </h1>
        <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-3xl">
          Tinjau daftar pertanyaan survei yang aktif dan tentukan masing-masing pertanyaan masuk ke
          dalam pilar 7 Kebiasaan Anak Indonesia Hebat mana. Opsi jawaban menggunakan skala baku (1–4).
        </p>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-extrabold flex items-center gap-2 shadow-sm">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Info Skala Jawaban Baku (Tetap 1-4) */}
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <SlidersHorizontal size={18} />
          </div>
          <div>
            <p className="text-xs font-extrabold text-[#090D16]">
              Skala Pilihan Jawaban Baku (Otomatis Diterapkan ke Semua Pertanyaan)
            </p>
            <p className="text-[11px] text-slate-600">
              Siswa memilih salah satu dari 4 tingkat frekuensi kebiasaan berikut saat mengisi survei:
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {FIXED_SCALE_OPTIONS.map((opt) => (
            <span
              key={opt.score}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-extrabold text-indigo-950"
            >
              Skor {opt.score}: {opt.label}
            </span>
          ))}
        </div>
      </div>

      {/* Form Tambah / Edit Pertanyaan Survei */}
      <form
        onSubmit={handleSaveQuestion}
        className="bg-white/95 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <h2 className="font-heading text-base font-extrabold text-[#090D16] flex items-center gap-2">
            {editingId ? (
              <Pencil size={17} className="text-amber-600" />
            ) : (
              <Plus size={17} className="text-indigo-700" />
            )}
            <span>{editingId ? 'Edit Pertanyaan Survei' : 'Tambah Pertanyaan Survei Baru'}</span>
          </h2>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
            >
              <X size={14} />
              <span>Batal Edit</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1.5">
              No. Urut
            </label>
            <input
              type="number"
              min={1}
              required
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 bg-white text-sm font-black text-[#090D16]"
            />
          </div>

          <div className="md:col-span-6">
            <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1.5">
              Teks Pertanyaan Survei
            </label>
            <input
              type="text"
              required
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Contoh: Saya bangun pagi sebelum pukul 05.30 WIB setiap hari..."
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 bg-white text-sm font-semibold text-[#090D16] focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1.5">
              Kategori 7 Kebiasaan Anak Indonesia Hebat
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 bg-white text-xs sm:text-sm font-extrabold text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              {SEVEN_KAIH_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 hover:opacity-95 text-white text-xs sm:text-sm font-extrabold shadow-md cursor-pointer disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{editingId ? 'Simpan Perubahan' : 'Simpan Pertanyaan Survei'}</span>
          </button>
        </div>
      </form>

      {/* Daftar Pertanyaan Survei & Pemetaan Kategori 7 KAIH */}
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-heading text-base font-extrabold text-[#090D16]">
              Daftar Pertanyaan Survei Aktif ({questions.length} Indikator)
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Pilih kategori 7 KAIH pada dropdown di sebelah kanan setiap pertanyaan untuk memperbarui pemetaan secara langsung.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-center py-8 text-xs font-bold text-slate-500 animate-pulse">
            Memuat daftar pertanyaan survei...
          </p>
        ) : questions.length === 0 ? (
          <p className="text-center py-8 text-xs font-bold text-slate-500">
            Belum ada pertanyaan di tabel survey_questions.
          </p>
        ) : (
          <div className="space-y-3">
            {questions.map((q, idx) => {
              const matchedCat =
                SEVEN_KAIH_CATEGORIES.find(
                  (c) => c.value.toLowerCase() === (q.category || '').toLowerCase()
                ) || SEVEN_KAIH_CATEGORIES[0]
              const CatIcon = matchedCat.icon

              return (
                <div
                  key={q.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-50/95 border border-slate-200/90 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    <span className="h-9 w-9 rounded-xl bg-indigo-950 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      Q{q.order_index || idx + 1}
                    </span>

                    <div className="space-y-1.5">
                      <p className="text-sm font-extrabold text-[#090D16] leading-snug">
                        {q.question_text}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[11px] font-extrabold ${matchedCat.badge}`}
                        >
                          <CatIcon size={12} />
                          <span>{q.category || 'Belum Dikategorikan'}</span>
                        </span>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          • Skala 1–4 (Tidak Pernah – Selalu)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Kategorisasi Cepat + Tombol Edit & Hapus */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                    <select
                      aria-label="Kategori 7 KAIH"
                      disabled={updatingId === q.id}
                      value={q.category || 'Bangun Pagi'}
                      onChange={(e) => handleQuickCategoryChange(q.id, e.target.value)}
                      className="px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-extrabold text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                    >
                      {SEVEN_KAIH_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleEditClick(q)}
                      title="Edit Teks Pertanyaan"
                      className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 cursor-pointer"
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(q.id)}
                      title="Hapus Pertanyaan"
                      className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}