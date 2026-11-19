'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Sparkles,
  ClipboardList,
  Gamepad2,
  PieChart,
  ArrowRight,
  Image as ImageIcon,
} from 'lucide-react'

type HomeConfig = {
  hero_title: string
  hero_subtitle: string
  logo_url: string | null
  poster_url: string | null
  hero_media_url: string | null
}

export default function HeroSection() {
  const supabase = createClient()

  const [config, setConfig] = useState<HomeConfig>({
    hero_title: 'Gerakan 7 Kebiasaan Anak Indonesia Hebat',
    hero_subtitle:
      'Membangun generasi berkarakter, sehat, cerdas, dan berakhlak mulia di SMAN 5 Semarang.',
    logo_url: null,
    poster_url: null,
    hero_media_url: null,
  })

  const fetchHeroConfig = useCallback(async () => {
    const { data, error } = await supabase
      .from('home_config')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!error && data) {
      setConfig({
        hero_title: data.hero_title || 'Gerakan 7 Kebiasaan Anak Indonesia Hebat',
        hero_subtitle:
          data.hero_subtitle ||
          'Membangun generasi berkarakter, sehat, cerdas, dan berakhlak mulia di SMAN 5 Semarang.',
        logo_url: data.logo_url || null,
        poster_url: data.poster_url || null,
        hero_media_url: data.hero_media_url || null,
      })
    }
  }, [supabase])

  useEffect(() => {
    fetchHeroConfig()

    const channel = supabase
      .channel('realtime-hero-section-config')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'home_config' },
        () => fetchHeroConfig()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchHeroConfig, supabase])

  const rightHeroImage = config.hero_media_url || config.poster_url
  const showSeparatePosterCard = Boolean(config.poster_url)

  return (
    <div className="space-y-5">
      {/* === HERO BANNER UTAMA (LOGO + TEKS + BANNER HERO) === */}
      <section className="rounded-[2rem] bg-gradient-to-br from-indigo-950 via-indigo-900 to-sky-800 text-white p-6 sm:p-9 lg:p-10 shadow-2xl border border-indigo-400/20 relative overflow-hidden">
        <Sparkles
          size={190}
          className="absolute -right-10 -bottom-10 text-white/[0.06] pointer-events-none"
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
          {/* Kolom Kiri: Logo Sekolah/Nexara & Teks */}
          <div className={`${rightHeroImage ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-5`}>
            <div className="flex flex-wrap items-center gap-3">
              {config.logo_url && (
                <img
                  src={config.logo_url}
                  alt="Logo Sekolah / Nexara"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                  className="h-14 w-14 rounded-2xl object-cover bg-white/15 p-1.5 border border-white/25 shadow-md"
                />
              )}

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/12 border border-white/20 text-[11px] font-extrabold text-sky-200 uppercase tracking-wider">
                <Sparkles size={13} className="text-sky-300" />
                <span>SMAN 5 Semarang • Evaluasi Karakter 7 KAIH</span>
              </div>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {config.hero_title}
            </h1>

            <p className="text-sm sm:text-base text-indigo-100 leading-relaxed max-w-2xl">
              {config.hero_subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/survey"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 to-emerald-400 hover:opacity-95 text-indigo-950 text-xs sm:text-sm font-black shadow-lg transition-all"
              >
                <ClipboardList size={17} />
                <span>Mulai Isi Survei Harian</span>
                <ArrowRight size={15} />
              </Link>

              <Link
                href="/game"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs sm:text-sm font-extrabold transition-all"
              >
                <Gamepad2 size={17} />
                <span>Mainkan Kuis XP</span>
              </Link>

              <Link
                href="/statistik"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-950/50 hover:bg-slate-950/75 border border-white/15 text-sky-200 text-xs sm:text-sm font-extrabold transition-all"
              >
                <PieChart size={17} />
                <span>Statistik Pribadi</span>
              </Link>
            </div>
          </div>

          {/* Kolom Kanan: Gambar / Banner Hero Tambahan */}
          {rightHeroImage && (
            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden border-2 border-white/25 bg-slate-950/40 shadow-2xl">
                <img
                  src={rightHeroImage}
                  alt="Banner Hero Utama 7 KAIH"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                  className="w-full max-h-80 object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* === KARTU POSTER INFOGRAFIS 7 KAIH (FOTO KE-3 DARI ADMIN) === */}
      {showSeparatePosterCard && config.poster_url && (
        <section className="kaih-glass-card p-5 sm:p-6 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-900 text-[11px] font-extrabold uppercase tracking-wider">
              <ImageIcon size={13} />
              <span>Poster & Infografis Resmi 7 KAIH</span>
            </div>
            <span className="text-xs font-bold text-slate-600">SMAN 5 Semarang</span>
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/90 bg-slate-950/5 shadow-md">
            <img
              src={config.poster_url}
              alt="Poster Infografis 7 Kebiasaan Anak Indonesia Hebat"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
              className="w-full max-h-[520px] object-contain mx-auto bg-slate-950/90"
            />
          </div>
        </section>
      )}
    </div>
  )
}