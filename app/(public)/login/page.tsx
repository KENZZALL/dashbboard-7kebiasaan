'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  KeyRound,
} from 'lucide-react'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null)

  // Otomatis arahkan ke /admin jika sesi admin sudah aktif
  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active && session) {
        router.replace('/admin')
      }
    })
    return () => {
      active = false
    }
  }, [router, supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || loginSuccess) return

    setLoading(true)
    setErrorMsg('')

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setErrorMsg('Email atau kata sandi admin tidak sesuai. Silakan periksa kembali.')
      setLoading(false)
    } else {
      localStorage.setItem('kaih_admin_auth', 'true')
      setLoading(false)
      setLoginSuccess(true)

      setTimeout(() => {
        router.push('/admin')
        router.refresh()
      }, 650)
    }
  }

  return (
    <div className="min-h-screen bg-[#EEF2FA] flex items-center justify-center py-6 px-4 font-sans text-[#090D16] relative overflow-hidden">
      {/* Dekorasi Ambient Latar Belakang Indigo - Ungu - Biru Langit */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-[2rem] overflow-hidden shadow-2xl border border-white/90 kaih-glass-card">
        {/* === PANEL KIRI: IDENTITAS DARK LUXURY SMAN 5 SEMARANG === */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950 via-indigo-900 to-sky-800 text-white p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          <Sparkles
            size={150}
            className="absolute -right-8 -bottom-8 text-white/[0.07] pointer-events-none"
          />

          <div className="space-y-4 relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-extrabold text-sky-200 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-full border border-white/15 transition-all"
            >
              <ArrowLeft size={14} />
              <span>Kembali ke Beranda</span>
            </Link>

            <div className="pt-2 space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-300/30 text-[11px] font-extrabold text-sky-200">
                <ShieldCheck size={13} />
                <span>OTENTIKASI PENGELOLA</span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl font-black leading-tight text-white">
                Portal Admin <span className="text-sky-300">7 KAIH</span>
              </h1>

              <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
                Akses terpadu untuk mengelola beranda publik, memantau indeks karakter siswa, serta mengekspor database survei SMAN 5 Semarang.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-white/15 space-y-2.5 relative z-10">
            <div className="flex items-center gap-2.5 text-xs text-indigo-100 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>Sinkronisasi Real-Time Supabase Aktif</span>
            </div>
            <p className="text-[11px] text-indigo-200/80">
              SMAN 5 Semarang • Gerakan 7 Kebiasaan Anak Indonesia Hebat
            </p>
          </div>
        </div>

        {/* === PANEL KANAN: FORMULIR LOGIN INTERAKTIF === */}
        <div className="lg:col-span-7 bg-white/95 backdrop-blur-xl p-7 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-sm">
                <KeyRound size={18} />
              </div>
              <div>
                <h2 className="font-heading text-xl font-black text-[#090D16]">
                  Masuk ke Dashboard
                </h2>
                <p className="text-xs font-semibold text-slate-600">
                  Gunakan akun administrator resmi sekolah
                </p>
              </div>
            </div>
          </div>

          {/* Notifikasi Error Interaktif */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Notifikasi Sukses Beranimasi */}
          {loginSuccess && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-extrabold flex items-center gap-2.5">
              <CheckCircle2 size={17} className="text-emerald-600 shrink-0" />
              <span>Verifikasi berhasil! Membuka Panel Kendali Admin...</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Input Email */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-extrabold text-[#090D16] uppercase tracking-wider">
                  Email Administrator
                </label>
                {!email.includes('@') && email.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setEmail(`${email.trim()}@sman5semarang.sch.id`)}
                    className="text-[11px] font-extrabold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                  >
                    + @sman5semarang.sch.id
                  </button>
                )}
              </div>

              <div
                className={`relative flex items-center rounded-2xl border bg-white transition-all ${
                  focusedField === 'email'
                    ? 'border-indigo-600 ring-4 ring-indigo-500/15'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
              >
                <Mail
                  size={16}
                  className={`ml-3.5 shrink-0 transition-colors ${
                    focusedField === 'email' ? 'text-indigo-600' : 'text-slate-500'
                  }`}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sman5semarang.sch.id"
                  className="w-full px-3 py-3 bg-transparent text-sm font-bold text-[#090D16] placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Input Kata Sandi + Toggle Intip Password */}
            <div>
              <label className="block text-[11px] font-extrabold text-[#090D16] uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>

              <div
                className={`relative flex items-center rounded-2xl border bg-white transition-all ${
                  focusedField === 'password'
                    ? 'border-indigo-600 ring-4 ring-indigo-500/15'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
              >
                <Lock
                  size={16}
                  className={`ml-3.5 shrink-0 transition-colors ${
                    focusedField === 'password' ? 'text-indigo-600' : 'text-slate-500'
                  }`}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full px-3 py-3 bg-transparent text-sm font-bold text-[#090D16] placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  className="px-3.5 py-2 text-slate-500 hover:text-indigo-700 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Tombol Submit Interaktif */}
            <button
              type="submit"
              disabled={loading || loginSuccess}
              className={`w-full py-3.5 px-5 rounded-2xl font-extrabold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 ${
                loginSuccess
                  ? 'bg-emerald-600'
                  : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 hover:opacity-95 active:scale-[0.99]'
              } disabled:opacity-70`}
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : loginSuccess ? (
                <>
                  <CheckCircle2 size={17} />
                  <span>Berhasil Masuk!</span>
                </>
              ) : (
                <>
                  <span>Masuk Panel Admin</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}