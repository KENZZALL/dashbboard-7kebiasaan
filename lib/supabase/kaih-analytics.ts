export interface IndicatorDetail {
  id: number
  dimension: string
  short: string
  full: string
  actionTip: string
}

export const INDICATOR_DETAILS: IndicatorDetail[] = [
  {
    id: 1,
    dimension: 'Bangun Pagi',
    short: 'Bangun Pagi',
    full: 'Saya bangun tidur sebelum pukul 05.30 pagi setiap hari.',
    actionTip: 'Pasang alarm pukul 05.15 dan jauhkan ponsel dari jangkauan kasur agar langsung bangun.',
  },
  {
    id: 2,
    dimension: 'Beribadah',
    short: 'Ibadah Tepat',
    full: 'Saya menjalankan ibadah sesuai dengan agama/kepercayaan saya tepat waktu.',
    actionTip: 'Jadikan waktu ibadah sebagai prioritas utama sebelum membuka hiburan atau bermain game.',
  },
  {
    id: 3,
    dimension: 'Beribadah',
    short: 'Berdoa Harian',
    full: 'Saya mengawali dan mengakhiri kegiatan harian (belajar dan makan) dengan berdoa.',
    actionTip: 'Biasakan berhenti sejenak 10 detik untuk berdoa sebelum mulai belajar atau makan.',
  },
  {
    id: 4,
    dimension: 'Berolahraga',
    short: 'Olahraga 3x',
    full: 'Saya melakukan aktivitas fisik atau olahraga minimal 3 kali seminggu.',
    actionTip: 'Jadwalkan jalan cepat, jogging, atau peregangan 20 menit setiap Selasa, Kamis, dan Minggu.',
  },
  {
    id: 5,
    dimension: 'Berolahraga',
    short: 'Ekskul/Sekolah',
    full: 'Saya berpartisipasi aktif dalam kegiatan olahraga di sekolah atau ekstrakurikuler.',
    actionTip: 'Ikuti sesi pemanasan dan praktik olahraga di sekolah dengan antusias penuh.',
  },
  {
    id: 6,
    dimension: 'Makan Sehat',
    short: 'Makan Sehat',
    full: 'Saya memilih makanan/jajanan sehat yang mengandung buah, sayur, atau protein.',
    actionTip: 'Tambahkan minimal 1 porsi buah atau sayur dan kurangi minuman manis kemasan hari ini.',
  },
  {
    id: 7,
    dimension: 'Gemar Belajar',
    short: 'Gemar Membaca',
    full: 'Saya meluangkan waktu membaca buku (non-pelajaran/literasi) minimal 15–30 menit setiap hari.',
    actionTip: 'Baca 5 halaman buku bacaan atau artikel edukatif sebelum waktu tidur malam.',
  },
  {
    id: 8,
    dimension: 'Bermasyarakat',
    short: 'Bantu Ortu',
    full: 'Saya membantu pekerjaan rumah tangga di rumah tanpa diperintah.',
    actionTip: 'Ambil inisiatif merapikan meja makan, menyapu, atau mencuci piring setelah makan.',
  },
  {
    id: 9,
    dimension: 'Tidur Cepat',
    short: 'Tidur Cepat',
    full: 'Saya tidur malam tidak melebihi pukul 21.30/22.00.',
    actionTip: 'Selesaikan tugas sekolah sebelum pukul 21.00 agar bisa bersiap tidur tepat waktu.',
  },
  {
    id: 10,
    dimension: 'Tidur Cepat',
    short: 'Bebas Gadget',
    full: 'Saya mematikan atau tidak menggunakan gadget/smartphone saat mendekati jam tidur malam.',
    actionTip: 'Aktifkan mode Jangan Ganggu (Do Not Disturb) 30 menit sebelum jam tidur.',
  },
]

export interface DimensionScore {
  label: string
  score: number
  target: number
}

export interface LeaderboardEntry {
  name: string
  kelas: string
  xp: number
  avgScore: number
  entries: number
}

export interface DashboardAnalytics {
  totalResponses: number
  overallScore: number
  completionPct: number
  barAverages: number[]
  sevenDimensions: DimensionScore[]
  leaderboard: LeaderboardEntry[]
  userXp: number
  userStreak: number
  userBadge: string
}

export function getPredicate(score: number) {
  if (score >= 3.4) {
    return {
      label: 'Membudaya • Tingkat 4',
      badge: 'Master Karakter',
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    }
  }
  if (score >= 2.75) {
    return {
      label: 'Konsisten • Tingkat 3',
      badge: 'Pelajar Teladan',
      color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    }
  }
  if (score >= 2.0) {
    return {
      label: 'Pembiasaan • Tingkat 2',
      badge: 'Pejuang Rutinitas',
      color: 'bg-amber-100 text-amber-700 border-amber-200',
    }
  }
  return {
    label: 'Rintisan • Tingkat 1',
    badge: 'Langkah Awal',
    color: 'bg-rose-100 text-rose-700 border-rose-200',
  }
}

export function mapToSevenDimensions(barAverages: number[]): DimensionScore[] {
  const avgPair = (a: number, b: number) => {
    const vals = [a, b].filter((v) => v > 0)
    if (vals.length === 0) return 0
    return Number((vals.reduce((x, y) => x + y, 0) / vals.length).toFixed(2))
  }

  return [
    { label: 'Bangun Pagi', score: barAverages[0] || 0, target: 3.6 },
    { label: 'Beribadah', score: avgPair(barAverages[1], barAverages[2]), target: 3.6 },
    { label: 'Berolahraga', score: avgPair(barAverages[3], barAverages[4]), target: 3.4 },
    { label: 'Makan Sehat', score: barAverages[5] || 0, target: 3.5 },
    { label: 'Gemar Belajar', score: barAverages[6] || 0, target: 3.5 },
    { label: 'Bermasyarakat', score: barAverages[7] || 0, target: 3.5 },
    { label: 'Tidur Cepat', score: avgPair(barAverages[8], barAverages[9]), target: 3.4 },
  ]
}

export function processSupabaseRows(rows: any[], studentEmail?: string | null): DashboardAnalytics {
  const sums = Array(10).fill(0)
  const validCounts = Array(10).fill(0)
  const studentMap = new Map<string, { name: string; kelas: string; entries: number; totalScore: number }>()

  rows.forEach((r: any) => {
    const rawScores =
      Array.isArray(r.answers_json) && r.answers_json.length > 0
        ? r.answers_json
        : [r.q1, r.q2, r.q3, r.q4, r.q5, r.q6, r.q7, r.q8, r.q9, r.q10]

    let rowSum = 0
    let rowValid = 0

    rawScores.forEach((rawVal: any, idx: number) => {
      const val = Number(rawVal)
      if (!isNaN(val) && val >= 1 && val <= 4) {
        if (idx < 10) {
          sums[idx] += val
          validCounts[idx] += 1
        }
        rowSum += val
        rowValid += 1
      }
    })

    const emailKey = String(r.email || r.nama || `siswa-${r.id}`).toLowerCase().trim()
    const displayName = String(r.nama || 'Siswa SMAN 5').trim()
    const displayKelas = String(r.kelas || 'SMAN 5').trim()
    const rowAvg = rowValid > 0 ? rowSum / rowValid : Number(r.rata_rata) || 0

    const existing = studentMap.get(emailKey)
    if (existing) {
      existing.entries += 1
      existing.totalScore += rowAvg
    } else {
      studentMap.set(emailKey, {
        name: displayName,
        kelas: displayKelas,
        entries: 1,
        totalScore: rowAvg,
      })
    }
  })

  const barAverages = sums.map((s, idx) =>
    validCounts[idx] > 0 ? Number((s / validCounts[idx]).toFixed(2)) : 0
  )

  const validAvgs = barAverages.filter((a) => a > 0)
  const overallScore =
    validAvgs.length > 0
      ? Number((validAvgs.reduce((a, b) => a + b, 0) / validAvgs.length).toFixed(2))
      : 0

  const completionPct = Math.min(100, Math.round((overallScore / 4) * 100))
  const sevenDimensions = mapToSevenDimensions(barAverages)

  const leaderboard: LeaderboardEntry[] = Array.from(studentMap.values())
    .map((item) => {
      const avg = item.entries > 0 ? item.totalScore / item.entries : 0
      const xp = Math.round(item.entries * 250 + avg * 150)
      return {
        name: item.name,
        kelas: item.kelas,
        xp,
        avgScore: Number(avg.toFixed(2)),
        entries: item.entries,
      }
    })
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 5)

  let userXp = 250
  let userStreak = 1
  if (studentEmail) {
    const me = studentMap.get(studentEmail.toLowerCase().trim())
    if (me) {
      const avg = me.entries > 0 ? me.totalScore / me.entries : 0
      userXp = Math.round(me.entries * 250 + avg * 150)
      userStreak = me.entries
    }
  } else if (leaderboard.length > 0) {
    userXp = leaderboard[0].xp
    userStreak = leaderboard[0].entries
  }

  const predicate = getPredicate(overallScore)

  return {
    totalResponses: rows.length,
    overallScore,
    completionPct,
    barAverages,
    sevenDimensions,
    leaderboard,
    userXp,
    userStreak,
    userBadge: predicate.badge,
  }
}