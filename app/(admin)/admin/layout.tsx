'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Database,
  FileBarChart2,
  ClipboardEdit,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react'

const ADMIN_NAV_ITEMS = [
  {
    href: '/admin',
    label: 'Dashboard & Ringkasan',
    sub: 'Grafik & indeks 7 KAIH sekolah',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/admin/database',
    label: 'Database Per Kelas',
    sub: 'Rekap siswa & no. absen',
    icon: Database,
    exact: false,
  },
  {
    href: '/admin/indicators',
    label: 'Rincian Indikator (Q1–Q10)',
    sub: 'Detail skor 10 indikator',
    icon: FileBarChart2,
    exact: false,
  },
  {
    href: '/admin/questions',
    label: 'Kelola Pertanyaan Survei',
    sub: 'Pertanyaan & kategori 7 KAIH',
    icon: ClipboardEdit,
    exact: false,
  },
  {
    href: '/admin/settings',
    label: 'Pengaturan Tampilan',
    sub: 'Edit beranda, tentang & tim Nexara',
    icon: Settings,
    exact: false,
  },
]

function SevenHabitsEmblem({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Ikon 7 Kebiasaan Anak Indonesia Hebat"
    >
      <circle cx="20" cy="5.5" r="2.6" fill="#FDE047" />
      <circle cx="31.3" cy="11" r="2.4" fill="#FACC15" />
      <circle cx="34.1" cy="23.2" r="2.4" fill="#FDE047" />
      <circle cx="26.3" cy="33.1" r="2.4" fill="#FACC15" />
      <circle cx="13.7" cy="33.1" r="2.4" fill="#FDE047" />
      <circle cx="5.9" cy="23.2" r="2.4" fill="#FACC15" />
      <circle cx="8.7" cy="11" r="2.4" fill="#FDE047" />
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [adminEmail, setAdminEmail] = useState<string>('Administrator SMALA')

  useEffect(() => {
    let active = true

    async function checkAdminUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (active && user?.email) {
        setAdminEmail(user.email)
      }
    }

    checkAdminUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && session?.user?.email) {
        setAdminEmail(session.user.email)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans text-[#090D16] relative">
      {/* Lapisan Pendaran Gradasi Biru - Kuning SMALA di Latar Belakang Admin */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -top-28 -left-28 h-[28rem] w-[28rem] rounded-full bg-amber-300/30 blur-3xl" />
        <div className="absolute top-1/4 -right-24 h-[30rem] w-[30rem] rounded-full bg-sky-400/25 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 h-[28rem] w-[28rem] rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      {/* === SIDEBAR ADMIN DESKTOP (FROSTED GLASS + GRADASI BIRU-KUNING SMALA) === */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 shrink-0 p-4 sticky top-0 h-screen z-30">
        <div className="kaih-glass-card w-full h-full rounded-[2rem] p-4 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-5">
            {/* Header Brand Admin */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-950 via-blue-900 to-sky-800 text-white shadow-md border border-amber-300/30 flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-white/10 border border-amber-300/60 flex items-center justify-center shrink-0">
                <SevenHabitsEmblem className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                  <ShieldCheck size={11} />
                  <span>Admin Console</span>
                </div>
                <p className="font-heading text-sm font-black text-white truncate">
                  7 KAIH SMAN 5
                </p>
              </div>
            </div>

            {/* Label Menu */}
            <div className="space-y-1.5">
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
                Menu Utama Administrator
              </p>

              <nav className="space-y-1.5">
                {ADMIN_NAV_ITEMS.map((item) => {
                  const Icon = item.icon
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all group ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-900 via-blue-800 to-sky-600 text-white shadow-md ring-2 ring-amber-300/60'
                          : 'text-slate-800 hover:bg-white/80 hover:text-blue-950'
                      }`}
                    >
                      <span
                        className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? 'bg-white/15 text-amber-300'
                            : 'bg-blue-100/80 text-blue-800 group-hover:bg-blue-200/80'
                        }`}
                      >
                        <Icon size={18} />
                      </span>
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-extrabold truncate ${
                            isActive ? 'text-white' : 'text-[#090D16]'
                          }`}
                        >
                          {item.label}
                        </p>
                        <p
                          className={`text-[10px] truncate mt-0.5 ${
                            isActive ? 'text-sky-100' : 'text-slate-600'
                          }`}
                        >
                          {item.sub}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Footer Sidebar: Buka Portal Siswa & Logout */}
          <div className="space-y-2 pt-3 border-t border-slate-300/60">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/80 hover:bg-white border border-white text-xs font-extrabold text-blue-900 transition-all shadow-xs"
            >
              <span>Buka Portal Siswa</span>
              <ExternalLink size={14} />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-rose-500/15 hover:bg-rose-600 text-rose-800 hover:text-white border border-rose-300/60 text-xs font-extrabold transition-all cursor-pointer"
            >
              <LogOut size={15} />
              <span>Keluar dari Admin</span>
            </button>
          </div>
        </div>
      </aside>

      {/* === KONTEN UTAMA ADMIN === */}
      <div className="relative z-10 flex-1 min-w-0 p-3 sm:p-5 lg:p-6 max-w-[1440px] mx-auto w-full space-y-5">
        {/* Top Bar Admin (Mobile & Desktop) */}
        <header className="kaih-glass-card rounded-3xl sm:rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="lg:hidden h-9 w-9 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center shrink-0 cursor-pointer"
              aria-label="Menu Admin"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <span className="hidden sm:flex h-8 w-8 rounded-xl bg-gradient-to-br from-blue-950 via-blue-800 to-sky-600 border border-amber-300/70 items-center justify-center shrink-0">
              <SevenHabitsEmblem className="w-5 h-5" />
            </span>

            <p className="text-[11px] sm:text-xs font-black tracking-wide text-slate-900 truncate">
              PANEL ADMINISTRATOR •{' '}
              <span className="text-blue-800">7 KAIH SMAN 5 SEMARANG</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100/90 border border-amber-300/80 text-[11px] font-extrabold text-amber-950 max-w-[220px] truncate">
              <ShieldCheck size={13} className="text-amber-600 shrink-0" />
              <span className="truncate">{adminEmail}</span>
            </span>

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-900 text-amber-300 text-xs font-extrabold"
            >
              <span>Portal</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </header>

        {/* Drawer Menu Mobile */}
        {mobileOpen && (
          <div className="lg:hidden kaih-glass-card rounded-3xl p-4 space-y-2 shadow-xl">
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-extrabold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-900 to-sky-600 text-amber-300'
                      : 'text-slate-800 hover:bg-white/80'
                  }`}
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-rose-600 text-white text-xs font-extrabold mt-2 cursor-pointer"
            >
              <LogOut size={15} />
              <span>Keluar dari Admin</span>
            </button>
          </div>
        )}

        {/* Isi Halaman Admin */}
        <main>{children}</main>
      </div>
    </div>
  )
}