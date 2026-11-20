'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
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

function sanitizeBerandaTitle(rawTitle?: string | null): string {
  const clean = (rawTitle || '').trim()
  if (!clean || clean.toLowerCase() === 'nexara') {
    return 'Dashboard 7KAIH'
  }
  return clean
}

export default function HeroSection() {
  const supabase = createClient()

  const [config, setConfig] = useState<HomeConfig>({
    hero_title: 'Dashboard 7KAIH',
    hero_subtitle: '7 Kebiasaan Anak Indonesia Hebat • SMAN 5 Semarang',
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
        hero_title: sanitizeBerandaTitle(data.hero_title),
        hero_subtitle:
          data.hero_subtitle && data.hero_subtitle.toLowerCase() !== 'nexara'
            ? data.hero_subtitle
            : '7 Kebiasaan Anak Indonesia Hebat • SMAN 5 Semarang',
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
      {/* === HERO BANNER UTAMA === */}
      <section className="rounded-[2rem] bg-gradient-to-br from-indigo-950 via-indigo-900 to-sky-800 text-white p-6 sm:p-9 lg:p-10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
          {/* Kolom Kiri: Logo Tanpa Kotak Latar & Teks Ringkas */}
          <div className={`${rightHeroImage ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
            <div className="flex items-center gap-3.5">
              {config.logo_url && (
                <img
                  src={config.logo_url}
                  alt="Logo SMAN 5 Semarang"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                  className="h-14 w-14 sm:h-16 sm:w-16 object-contain bg-transparent shrink-0"
                />
              )}

              <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-300">
                SMAN 5 Semarang
              </p>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {config.hero_title}
            </h1>

            <p className="text-sm sm:text-base text-indigo-100/90 font-medium leading-relaxed max-w-xl">
              {config.hero_subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Link
                href="/survey"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-400 to-emerald-400 hover:opacity-95 text-indigo-950 text-xs sm:text-sm font-black shadow-lg transition-all"
              >
                <ClipboardList size={16} />
                <span>Isi Survei</span>
                <ArrowRight size={15} />
              </Link>

              <Link
                href="/statistik"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-extrabold transition-all"
              >
                <PieChart size={16} className="text-sky-300" />
                <span>Statistik Saya</span>
              </Link>

              <Link
                href="/game"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-extrabold transition-all"
              >
                <Gamepad2 size={16} className="text-amber-300" />
                <span>Kuis XP</span>
              </Link>
            </div>
          </div>

          {/* Kolom Kanan: Logo / Gambar Utama Tanpa Kotak Latar Belakang */}
          {rightHeroImage && (
            <div className="lg:col-span-5 flex items-center justify-center">
              <img
                src={rightHeroImage}
                alt="Logo SMAN 5 Semarang"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
                className="w-52 h-52 sm:w-64 sm:h-64 object-contain bg-transparent drop-shadow-lg"
              />
            </div>
          )}
        </div>
      </section>

      {/* === KARTU POSTER INFOGRAFIS 7 KAIH === */}
      {showSeparatePosterCard && config.poster_url && (
        <section className="kaih-glass-card p-5 sm:p-6 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-indigo-950 text-xs font-extrabold uppercase tracking-wider">
              <ImageIcon size={14} className="text-indigo-700" />
              <span>Infografis 7 KAIH</span>
            </div>
            <span className="text-xs font-bold text-slate-600">SMAN 5 Semarang</span>
          </div>

          <div className="rounded-2xl overflow-hidden">
            <img
              src={config.poster_url}
              alt="Poster Infografis 7 Kebiasaan Anak Indonesia Hebat"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
              className="w-full max-h-[520px] object-contain mx-auto bg-transparent"
            />
          </div>
        </section>
      )}
    </div>
  )
}