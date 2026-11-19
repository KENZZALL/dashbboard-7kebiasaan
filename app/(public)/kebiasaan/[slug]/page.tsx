'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  Lightbulb,
  ClipboardList,
  Sparkles,
  BookOpen,
  Sunrise,
  HeartHandshake,
  Dumbbell,
  Apple,
  BookOpenCheck,
  Users,
  MoonStar,
  Target,
} from 'lucide-react'

const HABIT_GUIDES_DEFAULT = [
  {
    slug: 'bangun-pagi',
    num: '1',
    title: 'Bangun Pagi',
    tag: 'Disiplin diri',
    accentGradient: 'from-orange-500 to-amber-700',
    summary: 'Membiasakan diri bangun pagi membantu memulai hari dengan lebih teratur, segar, dan siap menjalani kegiatan.',
    whatToDo: ['Bangun pada waktu yang sama setiap hari.', 'Rapikan tempat tidur setelah bangun.', 'Gunakan waktu pagi untuk bersiap tanpa terburu-buru.'],
    howToDo: ['Tentukan waktu tidur dan bangun yang cukup.', 'Letakkan alarm jauh dari tempat tidur.', 'Majukan jadwal bangun secara bertahap.'],
    tips: ['Siapkan perlengkapan sekolah pada malam hari.', 'Kurangi penggunaan gawai menjelang tidur.', 'Catat kemajuan rutinitas setiap hari.'],
    keyMetrics: [{ label: 'Waktu bangun', value: 'Konsisten setiap hari' }],
    articleParagraphs: [{ heading: 'Awali hari dengan teratur', body: 'Bangun pagi memberi waktu untuk mempersiapkan diri dan menjalani kegiatan tanpa tergesa-gesa. Rutinitas yang konsisten juga melatih tanggung jawab.' }],
  },
  {
    slug: 'beribadah',
    num: '2',
    title: 'Beribadah',
    tag: 'Spiritualitas',
    accentGradient: 'from-violet-600 to-indigo-800',
    summary: 'Beribadah secara teratur membangun rasa syukur, ketenangan, dan kepedulian terhadap nilai-nilai kebaikan.',
    whatToDo: ['Luangkan waktu untuk beribadah setiap hari.', 'Jalankan ibadah dengan tertib dan penuh perhatian.', 'Hormati orang lain yang menjalankan keyakinannya.'],
    howToDo: ['Susun kegiatan harian agar tersedia waktu beribadah.', 'Siapkan kebutuhan ibadah sebelumnya.', 'Pelajari dan hayati nilai kebaikan dalam ibadah.'],
    tips: ['Gunakan pengingat bila diperlukan.', 'Ajak keluarga saling mendukung.', 'Bangun kebiasaan dengan tekun, bukan terburu-buru.'],
    keyMetrics: [{ label: 'Rutinitas', value: 'Teratur dan khusyuk' }],
    articleParagraphs: [{ heading: 'Menumbuhkan nilai kebaikan', body: 'Ibadah dapat menjadi waktu untuk menenangkan diri, bersyukur, dan memperkuat komitmen untuk berbuat baik dalam kehidupan sehari-hari.' }],
  },
  {
    slug: 'berolahraga',
    num: '3',
    title: 'Berolahraga',
    tag: 'Kesehatan',
    accentGradient: 'from-emerald-500 to-teal-800',
    summary: 'Olahraga teratur menjaga kebugaran tubuh dan membantu membangun semangat serta gaya hidup aktif.',
    whatToDo: ['Lakukan aktivitas fisik secara rutin.', 'Pilih olahraga yang aman dan sesuai kemampuan.', 'Awali dan akhiri latihan dengan pemanasan dan pendinginan.'],
    howToDo: ['Jadwalkan waktu olahraga dalam sepekan.', 'Mulai dari durasi dan gerakan ringan.', 'Tingkatkan aktivitas secara bertahap.'],
    tips: ['Pilih kegiatan yang menyenangkan.', 'Ajak teman atau keluarga berolahraga.', 'Cukupi minum dan beristirahat setelah latihan.'],
    keyMetrics: [{ label: 'Aktivitas', value: 'Rutin dan aman' }],
    articleParagraphs: [{ heading: 'Aktif untuk tubuh yang bugar', body: 'Aktivitas fisik yang dilakukan secara teratur mendukung kebugaran. Pilih gerakan yang sesuai kondisi tubuh dan lakukan dengan memperhatikan keselamatan.' }],
  },
  {
    slug: 'makan-sehat-bergizi',
    num: '4',
    title: 'Makan Sehat dan Bergizi',
    tag: 'Gizi seimbang',
    accentGradient: 'from-lime-500 to-green-800',
    summary: 'Pilihan makanan beragam dan bergizi membantu memenuhi kebutuhan tubuh untuk belajar, tumbuh, dan beraktivitas.',
    whatToDo: ['Pilih makanan yang beragam dan bergizi seimbang.', 'Sertakan sayur dan buah dalam menu.', 'Minum air putih yang cukup.'],
    howToDo: ['Biasakan sarapan sebelum beraktivitas.', 'Perhatikan kebersihan makanan.', 'Batasi makanan tinggi gula, garam, dan lemak.'],
    tips: ['Rencanakan pilihan bekal yang sehat.', 'Coba sayur dan buah dengan variasi berbeda.', 'Makan secukupnya dan teratur.'],
    keyMetrics: [{ label: 'Pilihan makanan', value: 'Beragam dan seimbang' }],
    articleParagraphs: [{ heading: 'Memilih asupan dengan bijak', body: 'Pola makan yang beragam membantu tubuh memperoleh zat gizi yang diperlukan. Kebiasaan memilih makanan sehat dapat dimulai dari porsi dan pilihan sehari-hari.' }],
  },
  {
    slug: 'gemar-membaca',
    num: '5',
    title: 'Gemar Membaca',
    tag: 'Literasi',
    accentGradient: 'from-sky-500 to-blue-800',
    summary: 'Membaca secara rutin menambah wawasan, melatih pemahaman, dan membuka kesempatan untuk mempelajari hal baru.',
    whatToDo: ['Sediakan waktu untuk membaca setiap hari.', 'Pilih bacaan yang bermanfaat dan menarik.', 'Catat informasi atau gagasan penting.'],
    howToDo: ['Mulai dengan target membaca yang ringan.', 'Pilih tempat yang nyaman dan minim gangguan.', 'Ceritakan kembali hal yang telah dibaca.'],
    tips: ['Bawa buku saat memiliki waktu luang.', 'Jelajahi berbagai jenis bacaan.', 'Berdiskusi dengan teman tentang bacaan.'],
    keyMetrics: [{ label: 'Kebiasaan membaca', value: 'Rutin dan bermakna' }],
    articleParagraphs: [{ heading: 'Belajar melalui membaca', body: 'Membaca membantu memperluas pengetahuan dan melatih kemampuan memahami informasi. Konsistensi lebih penting daripada menetapkan target yang terlalu berat.' }],
  },
  {
    slug: 'membantu-orang-tua',
    num: '6',
    title: 'Membantu Orang Tua',
    tag: 'Kepedulian',
    accentGradient: 'from-rose-500 to-red-800',
    summary: 'Membantu orang tua melalui tindakan sehari-hari merupakan wujud kepedulian, rasa hormat, dan tanggung jawab di rumah.',
    whatToDo: ['Tanyakan bantuan apa yang dibutuhkan.', 'Kerjakan tanggung jawab rumah dengan baik.', 'Berkomunikasi dengan sopan dan penuh perhatian.'],
    howToDo: ['Pilih tugas rumah yang sesuai kemampuan.', 'Atur waktu agar tugas sekolah dan rumah seimbang.', 'Selesaikan bantuan yang sudah disanggupi.'],
    tips: ['Lakukan tanpa harus selalu diminta.', 'Bekerja sama dengan anggota keluarga.', 'Hargai waktu dan tenaga orang tua.'],
    keyMetrics: [{ label: 'Kepedulian', value: 'Tulus dan bertanggung jawab' }],
    articleParagraphs: [{ heading: 'Kepedulian dimulai dari rumah', body: 'Bantuan sederhana di rumah dapat meringankan pekerjaan keluarga. Sikap tanggap, komunikasi yang baik, dan tanggung jawab membuat kebiasaan ini bermakna.' }],
  },
  {
    slug: 'istirahat-cukup',
    num: '7',
    title: 'Istirahat yang Cukup',
    tag: 'Keseimbangan diri',
    accentGradient: 'from-indigo-600 to-slate-900',
    summary: 'Istirahat yang cukup mendukung pemulihan tubuh dan membantu menjaga kesiapan untuk belajar serta beraktivitas.',
    whatToDo: ['Jaga waktu tidur yang teratur.', 'Berikan jeda saat belajar atau beraktivitas.', 'Hindari aktivitas yang mengganggu waktu tidur.'],
    howToDo: ['Buat rutinitas yang menenangkan sebelum tidur.', 'Atur jadwal belajar dan waktu luang.', 'Ciptakan lingkungan tidur yang nyaman.'],
    tips: ['Jauhkan gawai menjelang waktu tidur.', 'Usahakan tidur dan bangun pada waktu konsisten.', 'Sampaikan kepada orang dewasa bila sulit tidur berulang kali.'],
    keyMetrics: [{ label: 'Waktu istirahat', value: 'Cukup dan teratur' }],
    articleParagraphs: [{ heading: 'Menjaga keseimbangan aktivitas', body: 'Istirahat merupakan bagian penting dari rutinitas sehat. Mengatur kegiatan dan waktu tidur membantu tubuh memperoleh kesempatan untuk memulihkan diri.' }],
  },
]

const HABIT_ICON_MAP: Record<string, any> = {
  'bangun-pagi': Sunrise,
  beribadah: HeartHandshake,
  berolahraga: Dumbbell,
  'makan-sehat-bergizi': Apple,
  'gemar-membaca': BookOpenCheck,
  'membantu-orang-tua': Users,
  'istirahat-cukup': MoonStar,
}

export default function HabitDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const supabase = createClient()

  const habitIndex = HABIT_GUIDES_DEFAULT.findIndex((item) => item.slug === slug)
  if (habitIndex === -1) {
    notFound()
  }

  const baseHabit = HABIT_GUIDES_DEFAULT[habitIndex]
  const HabitIcon = HABIT_ICON_MAP[baseHabit.slug] || Sparkles

  const prevHabit =
    habitIndex > 0
      ? HABIT_GUIDES_DEFAULT[habitIndex - 1]
      : HABIT_GUIDES_DEFAULT[HABIT_GUIDES_DEFAULT.length - 1]
  const nextHabit =
    habitIndex < HABIT_GUIDES_DEFAULT.length - 1
      ? HABIT_GUIDES_DEFAULT[habitIndex + 1]
      : HABIT_GUIDES_DEFAULT[0]

  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [summaryText, setSummaryText] = useState<string>(baseHabit.summary)
  const [whatToDoList, setWhatToDoList] = useState<string[]>(baseHabit.whatToDo)
  const [howToDoList, setHowToDoList] = useState<string[]>(baseHabit.howToDo)
  const [tipsList, setTipsList] = useState<string[]>(baseHabit.tips)

  useEffect(() => {
    let active = true

    async function loadHabitFromDb() {
      const { data } = await supabase
        .from('habit_guides')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()

      if (active && data) {
        if (data.image_url) setImageUrl(data.image_url)
        // Gunakan ringkasan dari DB hanya jika cukup lengkap (lebih dari 60 karakter)
        if (data.summary && data.summary.trim().length > 60) {
          setSummaryText(data.summary)
        }
        if (Array.isArray(data.what_to_do) && data.what_to_do.length >= 3) {
          setWhatToDoList(data.what_to_do)
        }
        if (Array.isArray(data.how_to_do) && data.how_to_do.length >= 3) {
          setHowToDoList(data.how_to_do)
        }
        if (Array.isArray(data.tips) && data.tips.length >= 3) {
          setTipsList(data.tips)
        }
      }
    }

    loadHabitFromDb()

    const channel = supabase
      .channel(`realtime-habit-guide-${slug}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'habit_guides', filter: `slug=eq.${slug}` },
        () => loadHabitFromDb()
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [slug, supabase])

  return (
    <div className="space-y-6 font-sans text-[#090D16]">
      {/* Breadcrumb & Tombol Kembali */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/#kebiasaan-section"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 hover:bg-white border border-white text-xs font-extrabold text-indigo-800 shadow-xs transition-all"
        >
          <ArrowLeft size={15} />
          <span>Kembali ke Daftar 7 Kebiasaan</span>
        </Link>

        <span className="text-xs font-extrabold text-slate-800 bg-white/90 px-3.5 py-1.5 rounded-full border border-white">
          Dimensi Karakter #{baseHabit.num} dari 07
        </span>
      </div>

      {/* === HERO SHOWCASE: IDENTITAS KEBIASAAN (5 KOLOM) + FOTO DOMINAN (7 KOLOM) === */}
      <section
        className={`rounded-[2rem] bg-gradient-to-br ${baseHabit.accentGradient} text-white p-5 sm:p-7 lg:p-8 shadow-2xl border border-white/25 relative overflow-hidden`}
      >
        <HabitIcon
          size={240}
          className="absolute -left-10 -bottom-10 text-white/[0.07] pointer-events-none"
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Kolom Kiri (5 Kolom) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5 py-1">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-slate-950/75 text-white text-xs font-black tracking-wider">
                  KEBIASAAN #{baseHabit.num}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-extrabold">
                  {baseHabit.tag}
                </span>
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl lg:text-[2.65rem] font-black tracking-tight text-white leading-[1.12]">
                {baseHabit.title}
              </h1>

              <p className="text-sm sm:text-[15px] text-white/95 leading-relaxed font-medium">
                {summaryText}
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/survey"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white text-xs sm:text-sm font-extrabold shadow-xl transition-all"
              >
                <ClipboardList size={17} />
                <span>Evaluasi Kebiasaan Ini di Survei</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Kolom Kanan (7 Kolom): Bingkai Gambar Dominan */}
          <div className="lg:col-span-7 flex">
            {imageUrl ? (
              <div className="w-full h-[300px] sm:h-[380px] lg:h-[430px] rounded-3xl overflow-hidden border-2 border-white/40 bg-slate-950/30 shadow-2xl">
                <img
                  src={imageUrl}
                  alt={`Ilustrasi ${baseHabit.title}`}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            ) : (
              <div className="w-full min-h-[280px] sm:min-h-[360px] lg:min-h-[410px] rounded-3xl border border-white/30 bg-slate-950/25 backdrop-blur-md p-8 flex flex-col items-center justify-center text-center space-y-3 shadow-inner">
                <div className="h-20 w-20 rounded-3xl bg-white/15 border border-white/30 flex items-center justify-center shadow-lg">
                  <HabitIcon size={40} className="text-white" />
                </div>
                <div className="space-y-1 max-w-md">
                  <p className="font-heading text-lg font-extrabold text-white">
                    Visual Utama • {baseHabit.title}
                  </p>
                  <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                    Administrator dapat mengunggah foto ilustrasi kegiatan{' '}
                    <strong>{baseHabit.title}</strong> melalui menu Pengaturan Tampilan di Panel
                    Admin agar tampil penuh di bingkai ini.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* === STRIP INDIKATOR TARGET PELAKSANAAN === */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {baseHabit.keyMetrics.map((metric, idx) => (
          <div
            key={idx}
            className="kaih-glass-card px-5 py-4 rounded-2xl flex items-center gap-3.5"
          >
            <span className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Target size={19} />
            </span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
                {metric.label}
              </p>
              <p className="font-heading text-sm sm:text-base font-black text-[#090D16] mt-0.5">
                {metric.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* === BAGIAN 1: ARTIKEL PENJELASAN MENDALAM (3 PARAGRAF KOMPREHENSIF) === */}
      <article className="kaih-glass-card p-6 sm:p-8 lg:p-10 rounded-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <span className="h-11 w-11 rounded-2xl bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0">
              <BookOpen size={21} />
            </span>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">
                Wawasan & Pemahaman Karakter • SMAN 5 Semarang
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-black text-[#090D16]">
                Mengenal Lebih Dalam Kebiasaan {baseHabit.title}
              </h2>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {baseHabit.articleParagraphs.map((section, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/75 border border-white/90 space-y-2.5 shadow-2xs"
            >
              <h3 className="font-heading text-base sm:text-lg font-extrabold text-indigo-950">
                {section.heading}
              </h3>
              <p className="text-sm sm:text-[15px] text-slate-800 leading-[1.85] font-normal">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </article>

      {/* === BAGIAN 2: PANDUAN PRAKTIS HARIAN (3 KOLOM LENGKAP) === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. Apa yang Harus Dilakukan */}
        <div className="kaih-glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-200/80 pb-3">
            <span className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 size={19} />
            </span>
            <div>
              <h2 className="font-heading text-base font-extrabold text-[#090D16]">
                Apa yang Harus Dilakukan
              </h2>
              <p className="text-[11px] font-semibold text-slate-600">
                Langkah praktis setiap hari
              </p>
            </div>
          </div>

          <ul className="space-y-3.5">
            {whatToDoList.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 leading-relaxed"
              >
                <span className="h-5 w-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 2. Cara Melakukannya */}
        <div className="kaih-glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-200/80 pb-3">
            <span className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Compass size={19} />
            </span>
            <div>
              <h2 className="font-heading text-base font-extrabold text-[#090D16]">
                Cara Melakukannya
              </h2>
              <p className="text-[11px] font-semibold text-slate-600">
                Metode pembiasaan bertahap
              </p>
            </div>
          </div>

          <ul className="space-y-3.5">
            {howToDoList.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 leading-relaxed"
              >
                <span className="h-5 w-5 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Saran Supaya Konsisten */}
        <div className="kaih-glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-200/80 pb-3">
            <span className="h-9 w-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Lightbulb size={19} />
            </span>
            <div>
              <h2 className="font-heading text-base font-extrabold text-[#090D16]">
                Saran Supaya Konsisten
              </h2>
              <p className="text-[11px] font-semibold text-slate-600">
                Tips efektif untuk pelajar
              </p>
            </div>
          </div>

          <ul className="space-y-3.5">
            {tipsList.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 leading-relaxed"
              >
                <span className="h-5 w-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  ★
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Navigasi Antar Kebiasaan (Sebelumnya & Selanjutnya) */}
      <div className="kaih-glass-card p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <Link
          href={`/kebiasaan/${prevHabit.slug}`}
          className="w-full sm:w-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/85 hover:bg-white border border-white transition-all"
        >
          <ArrowLeft size={16} className="text-indigo-700 shrink-0" />
          <div>
            <p className="text-[10px] font-extrabold uppercase text-slate-500">
              Kebiasaan Sebelumnya (#{prevHabit.num})
            </p>
            <p className="text-xs font-extrabold text-[#090D16]">{prevHabit.title}</p>
          </div>
        </Link>

        <Link
          href={`/kebiasaan/${nextHabit.slug}`}
          className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs"
        >
          <div className="text-left sm:text-right">
            <p className="text-[10px] font-extrabold uppercase text-indigo-200">
              Kebiasaan Berikutnya (#{nextHabit.num})
            </p>
            <p className="text-xs font-extrabold text-white">{nextHabit.title}</p>
          </div>
          <ArrowRight size={16} className="shrink-0" />
        </Link>
      </div>
    </div>
  )
}