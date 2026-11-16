'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutGrid,
  FileText,
  Database,
  Users,
  LogOut,
  Home,
} from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const menuItems = [
    { label: 'Edit Beranda', href: '/admin', icon: LayoutGrid },
    { label: 'Edit Survey', href: '/admin/edit-survey', icon: FileText },
    { label: 'Database Survey', href: '/admin/survey', icon: Database },
    { label: 'Edit Tim Pengembang', href: '/admin/tim', icon: Users },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-slate-100/80 flex flex-col lg:flex-row font-sans">
      {/* Sidebar Gelap Elegan */}
      <aside className="w-full lg:w-72 bg-slate-950 text-white p-5 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div>
          <div className="flex items-center justify-between lg:justify-start gap-3 pb-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-sm shadow-md">
                NX
              </div>
              <div>
                <p className="text-sm font-extrabold tracking-wide">Panel Admin</p>
                <p className="text-[11px] text-slate-400">NEXARA • SMAN 5 Semarang</p>
              </div>
            </div>

            <Link
              href="/"
              className="lg:hidden px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-200 flex items-center gap-1"
            >
              <Home size={13} />
              <span>Beranda</span>
            </Link>
          </div>

          <nav className="mt-5 grid grid-cols-2 lg:grid-cols-1 gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="pt-5 mt-5 border-t border-slate-800 space-y-2 hidden lg:block">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all"
          >
            <Home size={16} className="text-blue-400" />
            <span>Lihat Beranda Publik</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-400 hover:bg-rose-950/50 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
    </div>
  )
}