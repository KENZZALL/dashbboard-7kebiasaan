'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Home,
  ClipboardList,
  Gamepad2,
  PieChart,
  Info,
  Shield,
  Sparkles,
  ArrowRight,
  PanelLeftOpen,
  PanelLeftClose,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', label: 'Beranda', icon: Home },
  { href: '/survey', label: 'Yuk Survey!', icon: ClipboardList },
  { href: '/game', label: 'Main Game', icon: Gamepad2 },
  { href: '/statistik', label: 'Statistik Saya', icon: PieChart },
  { href: '/tentang', label: 'Tentang', icon: Info },
  { href: '/login', label: 'Admin', icon: Shield },
]

/**
 * Ikon Vektor Khusus: 7 Bintang/Pilar Karakter Anak Indonesia Hebat
 * 7 titik sinar emas mengelilingi bintang pusat melambangkan 7 kebiasaan utama
 * yang membentuk generasi unggul SMAN 5 Semarang.
 */
function SevenHabitsEmblem({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Ikon 7 Kebiasaan Anak Indonesia Hebat"
    >
      {/* 7 Titik Cahaya Melingkar (Melambangkan 7 Kebiasaan Utama) */}
      <circle cx="20" cy="5.5" r="2.6" fill="#FDE047" />
      <circle cx="31.3" cy="11" r="2.4" fill="#FACC15" />
      <circle cx="34.1" cy="23.2" r="2.4" fill="#FDE047" />
      <circle cx="26.3" cy="33.1" r="2.4" fill="#FACC15" />
      <circle cx="13.7" cy="33.1" r="2.4" fill="#FDE047" />
      <circle cx="5.9" cy="23.2" r="2.4" fill="#FACC15" />
      <circle cx="8.7" cy="11" r="2.4" fill="#FDE047" />

      {/* Bintang Karakter Utama di Tengah (Simbol Pelajar Hebat & Berprestasi) */}
      <path
        d="M20 11L22.5 16.5L28.5 17.3L24.1 21.4L25.2 27.4L20 24.5L14.8 27.4L15.9 21.4L11.5 17.3L17.5 16.5L20 11Z"
        fill="#FFFFFF"
        stroke="#FDE047"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const supabase = createClient()
  const [totalResponses, setTotalResponses] = useState<number>(0)

  const [isPinned, setIsPinned] = useState<boolean>(false)
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const isSidebarOpen = isPinned || isHovered

  useEffect(() => {
    async function loadHeaderData() {
      const { count } = await supabase
        .from('survey_responses')
        .select('*', { count: 'exact', head: true })

      if (typeof count === 'number') setTotalResponses(count)
    }

    loadHeaderData()
  }, [supabase])

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar Navigasi Kiri */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden lg:flex lg:flex-col shrink-0 py-5 px-2.5 sticky top-0 h-screen z-40 transition-all duration-300 ease-out ${
          isSidebarOpen ? 'lg:w-64' : 'lg:w-20'
        }`}
      >
        <div className="kaih-glass-card w-full h-full rounded-[2rem] py-4 px-2.5 flex flex-col justify-between overflow-hidden">
          {/* Emblem 7 Kebiasaan Anak Indonesia Hebat: Ukuran & Sumbu Tengah 100% Sama dengan Menu (w-11 h-11) */}
          <Link
            href="/"
            title="7 Kebiasaan Anak Indonesia Hebat • SMAN 5 Semarang"
            className={`h-11 rounded-2xl flex items-center transition-all hover:scale-105 ${
              isSidebarOpen ? 'px-2 gap-3 justify-start' : 'w-11 mx-auto justify-center'
            }`}
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-950 via-blue-800 to-sky-600 border border-amber-300/70 shadow-md flex items-center justify-center shrink-0">
              <SevenHabitsEmblem className="w-7 h-7" />
            </div>

            {isSidebarOpen && (
              <div className="min-w-0">
                <p className="font-heading text-xs font-black text-blue-950 tracking-wide truncate">
                  7 KAIH SMALA
                </p>
                <p className="text-[10px] font-bold text-slate-600 truncate">
                  7 Pilar Karakter Hebat
                </p>
              </div>
            )}
          </Link>

          {/* Daftar Menu Navigasi (w-11 h-11 mx-auto — Segaris Vertikal Sempurna) */}
          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive =
                item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`h-11 rounded-2xl flex items-center transition-all ${
                    isSidebarOpen ? 'px-3.5 gap-3 justify-start' : 'w-11 mx-auto justify-center'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-900 via-blue-800 to-sky-600 text-amber-300 shadow-md ring-2 ring-amber-300/60'
                      : 'text-slate-800 hover:bg-white/80 hover:text-blue-950'
                  }`}
                >
                  <Icon size={19} className="shrink-0" />
                  {isSidebarOpen && (
                    <span className="text-xs font-extrabold tracking-wide whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Tombol Kunci / Buka Permanen Sidebar */}
          <button
            type="button"
            onClick={() => setIsPinned((prev) => !prev)}
            title={isPinned ? 'Kecilkan Sidebar Otomatis' : 'Kunci Sidebar Tetap Terbuka'}
            className={`h-11 rounded-2xl flex items-center border border-white/80 bg-white/65 hover:bg-white text-slate-800 hover:text-blue-900 transition-all cursor-pointer ${
              isSidebarOpen ? 'px-3.5 gap-3 justify-start' : 'w-11 mx-auto justify-center'
            }`}
          >
            {isPinned ? (
              <PanelLeftClose size={18} className="shrink-0 text-blue-800" />
            ) : (
              <PanelLeftOpen size={18} className="shrink-0 text-blue-800" />
            )}
            {isSidebarOpen && (
              <span className="text-[11px] font-extrabold whitespace-nowrap">
                {isPinned ? 'Lipat Otomatis' : 'Kunci Sidebar'}
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Konten Utama & Top Bar */}
      <div className="flex-1 min-w-0 px-3 sm:px-6 lg:pr-7 lg:pl-2 py-4 sm:py-5 pb-24 lg:pb-8 max-w-[1440px] mx-auto w-full space-y-4">
        {/* Top Header Bar dengan Emblem 7 KAIH */}
        <header className="kaih-glass-card rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-950 via-blue-800 to-sky-600 border border-amber-300/70 flex items-center justify-center shrink-0 shadow-2xs">
              <SevenHabitsEmblem className="w-6 h-6" />
            </span>
            <p className="text-[11px] sm:text-xs font-black tracking-wide text-slate-900 truncate">
              SMAN 5 SEMARANG •{' '}
              <span className="text-blue-800">7 KEBIASAAN ANAK INDONESIA HEBAT</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100/90 border border-amber-300/80 text-[11px] font-extrabold text-amber-950">
              <Sparkles size={13} className="text-amber-600" />
              <span>{totalResponses.toLocaleString('id-ID')} Rekapan</span>
            </span>

            <Link
              href="/survey"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-blue-900 via-blue-800 to-sky-700 hover:opacity-95 text-amber-300 text-xs font-extrabold shadow-xs transition-all"
            >
              <span>Mulai Survei</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </header>

        {/* Isi Halaman */}
        <main>{children}</main>
      </div>

      {/* Navigasi Bawah Khusus Mobile */}
      <nav className="lg:hidden fixed bottom-3 inset-x-3 z-40 kaih-glass-card rounded-2xl px-2 py-2 flex items-center justify-around shadow-xl">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold transition-all ${
                isActive
                  ? 'bg-blue-900 text-amber-300'
                  : 'text-slate-700 hover:text-blue-900'
              }`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}