'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Sparkles,
  Info,
  Target,
  Lightbulb,
  Users,
  School,
  ClipboardList,
  Gamepad2,
  ArrowRight,
  FolderKanban,
  ShieldCheck,
} from 'lucide-react'

type TeamMember = {
  id: string
  nama: string
  peran: string
  kelas_atau_jabatan: string | null
  deskripsi: string | null
  foto_url: string | null
  urutan: number
}

const HABIT_GUIDES_DEFAULT = [
  { slug: 'bangun-pagi', num: 1, tag: 'Disiplin', title: 'Bangun Pagi', shortDesc: 'Memulai hari lebih awal dengan semangat dan kesiapan.' },
  { slug: 'beribadah', num: 2, tag: 'Spiritual', title: 'Beribadah', shortDesc: 'Menjalankan ibadah sesuai agama dan kepercayaan.' },
  { slug: 'berolahraga', num: 3, tag: 'Sehat', title: 'Berolahraga', shortDesc: 'Menjaga kebugaran tubuh melalui aktivitas fisik.' },
  { slug: 'makan-sehat-dan-bergizi', num: 4, tag: 'Sehat', title: 'Makan Sehat dan Bergizi', shortDesc: 'Memilih makanan bergizi untuk mendukung kesehatan.' },
  { slug: 'gemar-belajar', num: 5, tag: 'Cerdas', title: 'Gemar Belajar', shortDesc: 'Menumbuhkan rasa ingin tahu dan kebiasaan belajar.' },
  { slug: 'bermasyarakat', num: 6, tag: 'Peduli', title: 'Bermasyarakat', shortDesc: 'Berinteraksi, bekerja sama, dan peduli terhadap sesama.' },
  { slug: 'tidur-cepat', num: 7, tag: 'Disiplin', title: 'Tidur Cepat', shortDesc: 'Beristirahat cukup agar siap menjalani hari berikutnya.' },
]

const DEFAULT_ABOUT = {
  what: 'Platform Digital 7 Kebiasaan Anak Indonesia Hebat (7 KAIH) SMAN 5 Semarang adalah sistem evaluasi karakter, edukasi pembiasaan harian, dan gamifikasi interaktif berbasis web yang dikembangkan untuk memantau penerapan tujuh dimensi karakter utama pelajar secara terstruktur dan real-time.',
  purpose:
    'Web ini digunakan oleh siswa SMAN 5 Semarang untuk mengisi survei refleksi kebiasaan harian (10 indikator skala 1–4), mempelajari panduan praktis 7 kebiasaan, menguji pemahaman melalui kuis interaktif berhadiah XP, serta memantau rapor perkembangan karakter pribadi. Bagi guru dan administrator sekolah, platform ini berfungsi sebagai pusat analitik untuk memetakan indeks karakter per kelas secara objektif.',
  why: 'Platform ini dibangun untuk menjawab kebutuhan pencatatan dan pembinaan karakter siswa yang modern, transparan, dan mudah diakses dari perangkat apa pun. Dengan mengubah evaluasi karakter menjadi pengalaman visual yang interaktif dan terukur, siswa terdorong membangun kebiasaan positif secara konsisten tanpa merasa terbebani.',
}

export default function TentangPage() {
  const supabase = createClient()

  const [aboutWhat, setAboutWhat] = useState(DEFAULT_ABOUT.what)
  const [aboutPurpose, setAboutPurpose] = useState(DEFAULT_ABOUT.purpose)
  const [aboutWhy, setAboutWhy] = useState(DEFAULT_ABOUT.why)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAboutData = useCallback(async () => {
    const [{ data: cfgData }, { data: teamData }] = await Promise.all([
      supabase
        .from('home_config')
        .select('about_what, about_purpose, about_why')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from('about_team').select('*').order('urutan', { ascending: true }),
    ])

    if (cfgData) {
      if (cfgData.about_what) setAboutWhat(cfgData.about_what)
      if (cfgData.about_purpose) setAboutPurpose(cfgData.about_purpose)
      if (cfgData.about_why) setAboutWhy(cfgData.about_why)
    }

    if (teamData) {
      setTeamMembers(teamData as TeamMember[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchAboutData()

    const channel = supabase
      .channel('realtime-tentang-page')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'home_config' },
        () => fetchAboutData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'about_team' },
        () => fetchAboutData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAboutData, supabase])

  return (
    <div className="space-y-6 font-sans text-[#090D16]">
      {/* === HERO BANNER LAMAN TENTANG === */}
      <section className="rounded-[2rem] bg-gradient-to-br from-indigo-950 via-indigo-900 to-sky-800 text-white p-6 sm:p-9 lg:p-10 shadow-2xl border border-indigo-400/20 relative overflow-hidden">
        <Sparkles
          size={190}
          className="absolute -right-10 -bottom-10 text-white/[0.06] pointer-events-none"
        />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-[11px] font-extrabold text-sky-200 uppercase tracking-wider">
            <School size={13} />
            <span>SMAN 5 SEMARANG • GERAKAN KARAKTER NASIONAL</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Tentang Platform 7 Kebiasaan Anak Indonesia Hebat
          </h1>

          <p className="text-sm sm:text-base text-indigo-100 leading-relaxed">
            Mengenal latar belakang, tujuan pemanfaatan, serta tim pengembang di balik sistem pemantauan karakter siswa SMAN 5 Semarang.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/survey"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-400 to-emerald-400 text-indigo-950 text-xs sm:text-sm font-black shadow-lg"
            >
              <ClipboardList size={16} />
              <span>Isi Survei Harian</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/game"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs sm:text-sm font-extrabold"
            >
              <Gamepad2 size={16} />
              <span>Coba Kuis 7 KAIH</span>
            </Link>
          </div>
        </div>
      </section>

      {/* === 3 KARTU PENJELASAN UTAMA: TENTANG APA, UNTUK APA, MENGAPA === */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. Tentang Apa Web Ini */}
        <div className="kaih-glass-card p-6 sm:p-7 rounded-3xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="h-11 w-11 rounded-2xl bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0">
                <Info size={21} />
              </span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
                  01 • Gambaran Umum
                </span>
                <h2 className="font-heading text-lg font-black text-[#090D16]">
                  Tentang Apa Web Ini?
                </h2>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-[1.8]">{aboutWhat}</p>
          </div>
        </div>

        {/* 2. Digunakan Untuk Apa */}
        <div className="kaih-glass-card p-6 sm:p-7 rounded-3xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="h-11 w-11 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                <Target size={21} />
              </span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                  02 • Fungsi & Manfaat
                </span>
                <h2 className="font-heading text-lg font-black text-[#090D16]">
                  Digunakan Untuk Apa?
                </h2>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-[1.8]">{aboutPurpose}</p>
          </div>
        </div>

        {/* 3. Mengapa Dibuat */}
        <div className="kaih-glass-card p-6 sm:p-7 rounded-3xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="h-11 w-11 rounded-2xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                <Lightbulb size={21} />
              </span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                  03 • Latar Belakang
                </span>
                <h2 className="font-heading text-lg font-black text-[#090D16]">
                  Mengapa Web Ini Dibuat?
                </h2>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-[1.8]">{aboutWhy}</p>
          </div>
        </div>
      </section>

      {/* === RINGKASAN 7 PILAR KEBIASAAN === */}
      <section className="kaih-glass-card p-6 sm:p-8 rounded-3xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-900 text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
              <FolderKanban size={13} />
              <span>7 Pilar Pembiasaan Karakter</span>
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-black text-[#090D16]">
              Ruang Lingkup 7 Kebiasaan Anak Indonesia Hebat
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {HABIT_GUIDES_DEFAULT.map((habit) => (
            <Link
              key={habit.slug}
              href={`/kebiasaan/${habit.slug}`}
              className="p-4 rounded-2xl bg-white/85 hover:bg-white border border-white hover:border-indigo-300 transition-all space-y-1.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-slate-950 text-white text-[10px] font-black">
                  #{habit.num}
                </span>
                <span className="text-[10px] font-extrabold text-indigo-700">{habit.tag}</span>
              </div>
              <h3 className="font-heading text-sm font-extrabold text-[#090D16] group-hover:text-indigo-700">
                {habit.title}
              </h3>
              <p className="text-[11px] text-slate-700 line-clamp-2 leading-relaxed">
                {habit.shortDesc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* === PEMBUAT DASHBOARD & TIM PENGEMBANG NEXARA === */}
      <section className="kaih-glass-card p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <span className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Users size={21} />
            </span>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">
                Kredit & Pengembang Sistem
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-black text-[#090D16]">
                Pembuat Dashboard & Tim Pengembang Nexara
              </h2>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-[11px] font-extrabold text-indigo-900">
            <ShieldCheck size={13} className="text-indigo-600" />
            <span>Dikelola Resmi oleh Admin SMAN 5 Semarang</span>
          </span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs font-bold text-slate-500 animate-pulse">
            Memuat profil tim pengembang...
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white/80 border border-white flex flex-col sm:flex-row items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
              NX
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">
                Tim Pengembang & Inovasi Digital
              </span>
              <h3 className="font-heading text-lg font-black text-[#090D16]">
                Tim Pengembang Nexara • SMAN 5 Semarang
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Merancang dan mengembangkan Platform Evaluasi Karakter 7 Kebiasaan Anak Indonesia Hebat (7 KAIH) berbasis analitik real-time untuk mendukung pembentukan karakter unggul siswa SMAN 5 Semarang.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="p-5 rounded-3xl bg-white/85 border border-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start gap-4">
                  {member.foto_url ? (
                    <img
                      src={member.foto_url}
                      alt={member.nama}
                      className="h-16 w-16 rounded-2xl object-cover border-2 border-indigo-200 shrink-0 shadow-xs"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
                      {member.nama.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-[10px] font-extrabold">
                      {member.peran}
                    </span>
                    <h3 className="font-heading text-base font-black text-[#090D16] leading-snug">
                      {member.nama}
                    </h3>
                    {member.kelas_atau_jabatan && (
                      <p className="text-xs font-bold text-slate-600">
                        {member.kelas_atau_jabatan}
                      </p>
                    )}
                  </div>
                </div>

                {member.deskripsi && (
                  <p className="text-xs text-slate-700 leading-relaxed pt-2 border-t border-slate-200/70">
                    {member.deskripsi}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}