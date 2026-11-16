'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, Gamepad2, ClipboardCheck, BarChart2 } from 'lucide-react'

export default function HeroSection({
  onLogoLoaded,
}: {
  onLogoLoaded?: (url: string) => void
}) {
  const supabase = createClient()
  const [config, setConfig] = useState({
    hero_title: 'NEXARA',
    hero_subtitle: '7 KEBIASAAN ANAK INDONESIA HEBAT • SMAN 5 SEMARANG',
    hero_media_url: '',
    hero_media_type: 'image',
    logo_url: '',
  })

  useEffect(() => {
    async function fetchHomeConfig() {
      const { data } = await supabase
        .from('home_config')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (data) {
        setConfig({
          hero_title: data.hero_title || 'NEXARA',
          hero_subtitle: data.hero_subtitle || '7 KEBIASAAN ANAK INDONESIA HEBAT',
          hero_media_url: data.hero_media_url || '',
          hero_media_type: data.hero_media_type || 'image',
          logo_url: data.logo_url || data.hero_media_url || '',
        })
        if (onLogoLoaded && (data.logo_url || data.hero_media_url)) {
          onLogoLoaded(data.logo_url || data.hero_media_url)
        }
      }
    }
    fetchHomeConfig()
  }, [])

  const hasCustomMedia = Boolean(config.hero_media_url)

  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-lg border border-slate-800/80 min-h-[290px] sm:min-h-[330px] flex items-center">
      {/* Background Otomatis dari Edit Beranda Admin */}
      {hasCustomMedia ? (
        config.hero_media_type === 'video' ? (
          <video
            src={config.hero_media_url}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-55"
          />
        ) : (
          <img
            src={config.hero_media_url}
            alt={config.hero_title}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
          />
        )
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900" />
      )}

      {/* Overlay Gelap Halus agar Teks Tetap Kontras & Tajam */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/40" />

      <div className="relative z-10 w-full p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-indigo-200">
            <span>7 KAIH • SMAN 5 SEMARANG</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight uppercase leading-tight drop-shadow-sm">
            {config.hero_title}
          </h1>

          <p className="text-sm sm:text-base text-slate-200 font-medium max-w-xl leading-relaxed">
            {config.hero_subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/survey"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-extrabold shadow-md transition-all"
            >
              <span>Isi Survey Sekarang</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/game"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white text-xs sm:text-sm font-bold transition-all"
            >
              <Gamepad2 size={16} className="text-amber-400" />
              <span>Mainkan Kuis Game</span>
            </Link>
          </div>
        </div>

        {/* Panel Navigasi Cepat Siswa */}
        <div className="lg:col-span-5 bg-slate-900/65 backdrop-blur-md border border-white/15 rounded-3xl p-4 sm:p-5 space-y-2.5">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-300 px-1">
            Navigasi Cepat Siswa
          </p>

          <Link
            href="/survey"
            className="flex items-center justify-between p-3 rounded-2xl bg-white/10 hover:bg-white/15 transition-all text-xs sm:text-sm font-bold"
          >
            <span className="flex items-center gap-2.5">
              <ClipboardCheck size={16} className="text-indigo-400" />
              <span>Yuk Survey! (Isi Evaluasi)</span>
            </span>
            <ArrowRight size={15} className="text-slate-300" />
          </Link>

          <Link
            href="/statistik"
            className="flex items-center justify-between p-3 rounded-2xl bg-white/10 hover:bg-white/15 transition-all text-xs sm:text-sm font-bold"
          >
            <span className="flex items-center gap-2.5">
              <BarChart2 size={16} className="text-emerald-400" />
              <span>Statistik Pribadi Saya</span>
            </span>
            <ArrowRight size={15} className="text-slate-300" />
          </Link>

          <Link
            href="/game"
            className="flex items-center justify-between p-3 rounded-2xl bg-white/10 hover:bg-white/15 transition-all text-xs sm:text-sm font-bold"
          >
            <span className="flex items-center gap-2.5">
              <Gamepad2 size={16} className="text-amber-400" />
              <span>Kuis Kebiasaan Harian</span>
            </span>
            <ArrowRight size={15} className="text-slate-300" />
          </Link>
        </div>
      </div>
    </section>
  )
}