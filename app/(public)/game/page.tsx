'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Volume2,
  VolumeX,
  Trophy,
  Sparkles,
  Zap,
  Clock,
  CheckCircle2,
  ArrowRight,
  Download,
  Share2,
  RotateCcw,
  BookOpen,
  Users,
  ShieldCheck,
  Flame,
  Star,
  Keyboard,
  Sunrise,
  HeartHandshake,
  Dumbbell,
  Apple,
  BookOpenCheck,
  MoonStar,
  Hand,
  ThumbsUp,
} from 'lucide-react'

type Option = {
  text: string
  habit: string
}

type QuestionData = {
  id: string
  time_slot: number
  pertanyaan: string
  opsi_a: Option
  opsi_b: Option
  opsi_c: Option
}

type AnswerRecord = {
  questionText: string
  selectedOptionText: string
  habit: string
}

type MascotPose = 'wave' | 'jump' | 'thumbsUp'

const MASCOT_QUOTES = [
  'Semangat! Satu kebiasaan kecil hari ini membentuk masa depan hebatmu! 🌱',
  'Keren! Pilihanmu mencerminkan karakter pelajar SMAN 5 Semarang! ✨',
  'Terus jaga ritme positifmu, setiap langkah konsisten sangat berarti! ⚡',
  'Wah, refleksi dirimu makin tajam! Lanjutkan ke tantangan berikutnya! 🎯',
]

export default function GameKuisPage() {
  const supabase = createClient()
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const [screen, setScreen] = useState<'start' | 'quiz' | 'result'>('start')
  const [currentQuestions, setCurrentQuestions] = useState<QuestionData[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [userAnswers, setUserAnswers] = useState<AnswerRecord[]>([])
  const [selectedChoiceKey, setSelectedChoiceKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [timerText, setTimerText] = useState('Rotasi Soal: --:--:--')
  const [slotThemeLabel, setSlotThemeLabel] = useState('SESI HARIAN • KARAKTER HEBAT')
  const [nexaraLogoUrl, setNexaraLogoUrl] = useState('')

  // Pose & Animasi Maskot
  const [mascotPose, setMascotPose] = useState<MascotPose>('wave')

  // Gamifikasi XP, Combo Streak & Speed Bonus
  const [xp, setXp] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [lastEarnedXp, setLastEarnedXp] = useState<number>(100)
  const [questionStartTime, setQuestionStartTime] = useState<number>(0)
  const [mascotSpeech, setMascotSpeech] = useState<string>(MASCOT_QUOTES[0])

  // Hasil & Refleksi
  const [resultTitle, setResultTitle] = useState('')
  const [resultDesc, setResultDesc] = useState('')
  const [personalTips, setPersonalTips] = useState<string[]>([])
  const [awarenessLevel, setAwarenessLevel] = useState<string>('')
  const [awarenessDesc, setAwarenessDesc] = useState<string>('')
  const [savedResultId, setSavedResultId] = useState<string | null>(null)
  const [copiedText, setCopiedText] = useState<boolean>(false)

  // AUDIO FX STATE
  const [isMuted, setIsMuted] = useState<boolean>(false)

  // STATISTIK KOMUNITAS
  const [communityPercentage, setCommunityPercentage] = useState<number | null>(null)
  const [totalPlayers, setTotalPlayers] = useState<number>(0)

  // Ambil total pemain aktif & Logo Nexara saat halaman dimuat
  useEffect(() => {
    async function loadInitialData() {
      const [{ count }, { data: homeCfg }] = await Promise.all([
        supabase.from('hasil_kuis').select('*', { count: 'exact', head: true }),
        supabase
          .from('home_config')
          .select('logo_url, hero_media_url')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ])

      if (count !== null) setTotalPlayers(count)
      if (homeCfg) setNexaraLogoUrl(homeCfg.logo_url || homeCfg.hero_media_url || '')
    }
    loadInitialData()
  }, [supabase])

  // SINTESIS SUARA AUDIO FX
  const playSound = (type: 'click' | 'combo' | 'fanfare') => {
    if (isMuted) return
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()

      if (type === 'click') {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(600, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.08)
        gain.gain.setValueAtTime(0.28, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.08)
      } else if (type === 'combo') {
        const notes = [523.25, 659.25, 783.99]
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.value = freq
          gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.055)
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.055 + 0.16)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(ctx.currentTime + idx * 0.055)
          osc.stop(ctx.currentTime + idx * 0.055 + 0.16)
        })
      } else if (type === 'fanfare') {
        const notes = [440, 554.37, 659.25, 880]
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'triangle'
          osc.frequency.value = freq
          gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1)
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.3)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(ctx.currentTime + idx * 0.1)
          osc.stop(ctx.currentTime + idx * 0.1 + 0.3)
        })
      }
    } catch (e) {
      console.warn('Audio FX Error:', e)
    }
  }

  const getCurrentTimeSlot = () => {
    const hour = new Date().getHours()
    if (hour >= 0 && hour < 6) return 0
    if (hour >= 6 && hour < 12) return 1
    if (hour >= 12 && hour < 18) return 2
    return 3
  }

  // Timer Rotasi 6 Jam & Label Tema Sesi
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const slot = getCurrentTimeSlot()
      const labels = [
        'SESI DINI HARI • KETAJAMAN NIAT',
        'SESI PAGI • ENERGI & DISIPLIN',
        'SESI SIANG • FOKUS & LITERASI',
        'SESI MALAM • REFLEKSI & KETENANGAN',
      ]
      setSlotThemeLabel(labels[slot])

      const secondsInDay = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
      const sixHoursInSeconds = 6 * 3600
      const secondsUntilNextSlot = sixHoursInSeconds - (secondsInDay % sixHoursInSeconds)

      const hours = Math.floor(secondsUntilNextSlot / 3600)
      const minutes = Math.floor((secondsUntilNextSlot % 3600) / 60)
      const seconds = secondsUntilNextSlot % 60

      setTimerText(
        `Rotasi Soal: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      )
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [])

  // Mulai Kuis & Fetch Soal dari Supabase
  const startGame = async () => {
    playSound('click')
    setScreen('quiz')
    setMascotPose('wave')
    setCurrentIndex(0)
    setScores({})
    setUserAnswers([])
    setSelectedChoiceKey(null)
    setXp(0)
    setCombo(0)
    setMaxCombo(0)
    setCommunityPercentage(null)
    setCopiedText(false)
    setLoading(true)

    const activeSlot = getCurrentTimeSlot()

    try {
      const { data, error } = await supabase
        .from('bank_soal')
        .select('*')
        .eq('time_slot', activeSlot)
        .limit(10)

      if (error) throw error

      if (data && data.length > 0) {
        setCurrentQuestions(data as QuestionData[])
        setQuestionStartTime(Date.now())
      } else {
        alert('Belum ada data soal untuk slot jam ini di database!')
        setScreen('start')
      }
    } catch (err: any) {
      console.error('Gagal mengambil data kuis:', err?.message || err)
      alert(`Gagal terhubung ke database Supabase: ${err?.message || 'Periksa koneksi RLS'}`)
      setScreen('start')
    } finally {
      setLoading(false)
    }
  }

  // Pilih Opsi Jawaban
  const selectOption = (optionKey: string, option: Option) => {
    if (selectedChoiceKey) return
    setSelectedChoiceKey(optionKey)

    const elapsedSeconds = questionStartTime > 0 ? (Date.now() - questionStartTime) / 1000 : 10
    const isFastAnswer = elapsedSeconds <= 8
    const nextCombo = isFastAnswer ? combo + 1 : 1
    const speedBonus = isFastAnswer ? 25 : 0
    const comboBonus = nextCombo >= 2 ? nextCombo * 10 : 0
    const earned = 100 + speedBonus + comboBonus

    setCombo(nextCombo)
    setMaxCombo((prev) => Math.max(prev, nextCombo))
    setLastEarnedXp(earned)
    setXp((prev) => prev + earned)

    setMascotPose(nextCombo >= 2 ? 'jump' : 'thumbsUp')

    if (nextCombo >= 2) {
      playSound('combo')
    } else {
      playSound('click')
    }

    const currentQ = currentQuestions[currentIndex]
    setMascotSpeech(MASCOT_QUOTES[(currentIndex + 1) % MASCOT_QUOTES.length])

    setScores((prev) => ({
      ...prev,
      [option.habit]: (prev[option.habit] || 0) + 1,
    }))

    const newAnswer: AnswerRecord = {
      questionText: currentQ.pertanyaan,
      selectedOptionText: option.text,
      habit: option.habit,
    }

    const updatedAnswers = [...userAnswers, newAnswer]
    setUserAnswers(updatedAnswers)

    setTimeout(() => {
      setSelectedChoiceKey(null)
      if (currentIndex + 1 < currentQuestions.length) {
        setCurrentIndex((prev) => prev + 1)
        setQuestionStartTime(Date.now())
        setMascotPose('wave')
      } else {
        showResult(updatedAnswers)
      }
    }, 620)
  }

  // Dukungan Shortcut Keyboard (A/1, B/2, C/3)
  useEffect(() => {
    if (screen !== 'quiz' || loading || selectedChoiceKey) return
    const currentQ = currentQuestions[currentIndex]
    if (!currentQ) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toUpperCase()
      if (k === 'A' || k === '1') selectOption('A', currentQ.opsi_a)
      else if (k === 'B' || k === '2') selectOption('B', currentQ.opsi_b)
      else if (k === 'C' || k === '3') selectOption('C', currentQ.opsi_c)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [screen, loading, selectedChoiceKey, currentIndex, currentQuestions])

  // Tampilkan Hasil Kuis & Simpan Ke Database
  const showResult = async (finalAnswers: AnswerRecord[]) => {
    setScreen('result')
    setMascotPose('thumbsUp')
    playSound('fanfare')

    let topHabit = 'Teratur'
    let maxScore = -1

    const tempScores: Record<string, number> = {}
    finalAnswers.forEach((ans) => {
      tempScores[ans.habit] = (tempScores[ans.habit] || 0) + 1
    })

    for (const [habit, score] of Object.entries(tempScores)) {
      if (score > maxScore) {
        maxScore = score
        topHabit = habit
      }
    }

    if (maxScore >= 8) {
      setAwarenessLevel('Fokus & Konsisten Tinggi 🎯')
      setAwarenessDesc(
        'Jawabanmu menunjukkan kecenderungan karakter yang sangat kuat dan konsisten di satu bidang utama.'
      )
    } else if (maxScore >= 5) {
      setAwarenessLevel('Seimbang & Reflektif ⚖️')
      setAwarenessDesc(
        'Kamu memiliki keseimbangan kebiasaan yang fleksibel dan mempertimbangkan situasi secara matang.'
      )
    } else {
      setAwarenessLevel('Eksploratif & Dinamis 🌟')
      setAwarenessDesc(
        'Jawabanmu bervariasi secara alami, menandakan kamu siap mencoba berbagai kebiasaan positif baru.'
      )
    }

    let title = '⚡ Si Pelopor Disiplin & Sehat'
    let desc =
      'Hebat! Kamu selalu konsisten dalam menjaga kebiasaan positif seperti bangun pagi dan menjaga kesehatan tubuh. Kamu panutan yang luar biasa!'
    let tips = [
      '💡 Pasang alarm berjarak dan langsung bangun tanpa tekan snooze biar energimu tidak drop.',
      '🥗 Cobalah sesekali bawa bekal buah atau jus dari rumah buat variasi nutrisi di sekolah.',
      '😴 Usahakan matikan layar HP 30 menit sebelum tidur biar kualitas tidurmu makin maksimal.',
    ]

    if (topHabit === 'Gemar Membaca') {
      title = '🌱 Si Cerdas Pembelajar Sejati'
      desc =
        'Kamu adalah anak yang selalu ingin tahu dan teratur! Rasa penasaranmu pada ilmu pengetahuan akan membawamu meraih cita-cita yang tinggi.'
      tips = [
        '📚 Buat target membaca santai minimal 10-15 halaman per hari dari buku impianmu.',
        '📝 Coba buat catatan ringkas atau rangkuman kreatif (mind map) biar ilmunya awet di kepala.',
        '🤝 Bagikan info menarik atau fakta unik yang baru kamu baca ke teman kelasmu!',
      ]
    } else if (topHabit === 'Gotong Royong' || topHabit === 'Sosial') {
      title = '🤝 Si Bintang Gotong Royong'
      desc =
        'Kamu punya kepedulian sosial yang tinggi! Sikap ramah dan suka membantumu membuat teman-teman merasa nyaman berada di dekatmu.'
      tips = [
        '✨ Tetap jadi inisiator kebaikan saat ada kegiatan kelompok atau piket kelas.',
        '💙 Ingat untuk tetap luangkan waktu istirahat buat diri sendiri alias "me time".',
        '💬 Jadilah pendengar yang baik ketika temanmu butuh tempat bercerita.',
      ]
    }

    setResultTitle(title)
    setResultDesc(desc)
    setPersonalTips(tips)

    try {
      const { data, error } = await supabase
        .from('hasil_kuis')
        .insert([{ profil_hasil: title, skor: tempScores }])
        .select()

      if (!error && data && data.length > 0) {
        setSavedResultId(data[0].id)
      }

      const { data: allResults, error: fetchErr } = await supabase
        .from('hasil_kuis')
        .select('profil_hasil')

      if (!fetchErr && allResults) {
        const total = allResults.length
        const matchCount = allResults.filter((r) => r.profil_hasil === title).length
        const percentage = total > 0 ? Math.round((matchCount / total) * 100) : 100

        setTotalPlayers(total)
        setCommunityPercentage(percentage)
      }
    } catch (err: any) {
      console.error('Gagal menyimpan/mengambil data statistik:', err?.message || err)
    }
  }

  // FUNGSI BAGIKAN TEKS HASIL
  const copyShareText = () => {
    playSound('click')
    const textToShare = `🎮 Tipe Kebiasaan Hebatku: ${resultTitle} (${xp} XP)\n"${resultDesc}"\n\nYuk ikutan kuis 7 Kebiasaan Anak Indonesia Hebat SMAN 5 Semarang!`
    navigator.clipboard.writeText(textToShare)
    setCopiedText(true)
    setTimeout(() => setCopiedText(false), 3000)
  }

  // FUNGSI GENERATE GAMBAR POSTER PNG
  const downloadResultCard = () => {
    playSound('click')
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 640
    canvas.height = 960

    ctx.fillStyle = '#F0F9F4'
    ctx.fillRect(0, 0, 640, 960)

    ctx.strokeStyle = '#2ECC71'
    ctx.lineWidth = 6
    ctx.strokeRect(16, 16, 608, 928)

    ctx.fillStyle = 'rgba(46, 204, 113, 0.08)'
    ctx.beginPath()
    ctx.arc(520, 100, 160, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(100, 880, 200, 0, Math.PI * 2)
    ctx.fill()

    ctx.textAlign = 'center'
    ctx.fillStyle = '#27AE60'
    ctx.font = '900 76px "Arial Black", sans-serif'
    ctx.fillText('7', 110, 92)

    ctx.fillStyle = '#1E8449'
    ctx.font = '900 32px "Arial Black", sans-serif'
    ctx.fillText('KEBIASAAN', 340, 78)
    ctx.fillText('ANAK HEBAT', 340, 114)

    ctx.fillStyle = '#E8F8F5'
    ctx.beginPath()
    ctx.roundRect(80, 134, 480, 36, 18)
    ctx.fill()
    ctx.fillStyle = '#1E8449'
    ctx.font = 'bold 15px sans-serif'
    ctx.fillText(`PROFIL: ${resultTitle.toUpperCase()}`, 320, 157)

    const drawCanvasMascot = (cX: number, cY: number) => {
      ctx.save()
      ctx.translate(cX, cY)

      ctx.strokeStyle = '#468826'
      ctx.lineWidth = 6
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(-14, 38)
      ctx.lineTo(-16, 54)
      ctx.moveTo(14, 38)
      ctx.lineTo(16, 54)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(-40, 6)
      ctx.lineTo(-56, 20)
      ctx.moveTo(40, 4)
      ctx.lineTo(58, -12)
      ctx.stroke()

      ctx.fillStyle = '#80C242'
      ctx.strokeStyle = '#468826'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(0, 0, 42, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#468826'
      ctx.beginPath()
      ctx.ellipse(0, -42, 6, 12, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#1C2D42'
      ctx.beginPath()
      ctx.arc(-14, -6, 7, 0, Math.PI * 2)
      ctx.arc(14, -6, 7, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.arc(-16, -8, 2.5, 0, Math.PI * 2)
      ctx.arc(12, -8, 2.5, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = 'rgba(255, 118, 117, 0.8)'
      ctx.beginPath()
      ctx.arc(-22, 4, 5, 0, Math.PI * 2)
      ctx.arc(22, 4, 5, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = '#3A6E1F'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(0, 2, 10, 0.2, Math.PI - 0.2)
      ctx.stroke()

      ctx.fillStyle = '#F1C40F'
      ctx.beginPath()
      ctx.arc(38, -30, 8, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    const drawHexagon = (
      x: number,
      y: number,
      radius: number,
      fillColor: string,
      strokeColor: string,
      title: string,
      isActive: boolean = false
    ) => {
      ctx.save()
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6
        const hX = x + radius * Math.cos(angle)
        const hY = y + radius * Math.sin(angle)
        if (i === 0) ctx.moveTo(hX, hY)
        else ctx.lineTo(hX, hY)
      }
      ctx.closePath()

      ctx.fillStyle = fillColor
      ctx.fill()
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = isActive ? 4 : 2
      ctx.stroke()

      ctx.fillStyle = isActive ? '#FFFFFF' : '#2C3E50'
      ctx.font = isActive ? 'bold 13px sans-serif' : '11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(title, x, y + 4)

      ctx.restore()
    }

    const centerX = 320
    const centerY = 370
    const r = 68

    const habits = [
      { name: 'Taat Beribadah', x: centerX, y: centerY, isCenter: true },
      { name: 'Rajin Belajar', x: centerX, y: centerY - r * 1.73 },
      { name: 'Makan Sehat', x: centerX + r * 1.5, y: centerY - r * 0.865 },
      { name: 'Tidur Cepat', x: centerX + r * 1.5, y: centerY + r * 0.865 },
      { name: 'Rajin Olahraga', x: centerX, y: centerY + r * 1.73 },
      { name: 'Bermasyarakat', x: centerX - r * 1.5, y: centerY + r * 0.865 },
      { name: 'Bangun Pagi', x: centerX - r * 1.5, y: centerY - r * 0.865 },
    ]

    habits.forEach((h) => {
      const isHighlighted =
        h.isCenter || resultTitle.toLowerCase().includes(h.name.toLowerCase().split(' ')[0])
      const fillColor = isHighlighted ? '#27AE60' : '#FFFFFF'
      const strokeColor = isHighlighted ? '#1E8449' : '#A6ACAF'
      drawHexagon(h.x, h.y, r, fillColor, strokeColor, h.name, isHighlighted)
    })

    drawCanvasMascot(centerX, centerY)

    const boxY = 575
    ctx.fillStyle = '#FFFFFF'
    ctx.strokeStyle = '#2ECC71'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.roundRect(40, boxY, 560, 260, 24)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#1E8449'
    ctx.font = 'bold 15px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('💡 Refleksi Kebiasaan Kamu:', 65, boxY + 36)

    ctx.fillStyle = '#4A5568'
    ctx.font = '13px sans-serif'

    const words = resultDesc.split(' ')
    let line = ''
    let lineY = boxY + 62
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' '
      const metrics = ctx.measureText(testLine)
      if (metrics.width > 500 && n > 0) {
        ctx.fillText(line, 65, lineY)
        line = words[n] + ' '
        lineY += 20
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, 65, lineY)

    if (personalTips.length > 0) {
      ctx.fillStyle = '#27AE60'
      ctx.font = 'bold 13px sans-serif'
      ctx.fillText('📌 Tips Utama:', 65, lineY + 32)
      ctx.fillStyle = '#2D3748'
      ctx.font = '12px sans-serif'
      ctx.fillText(personalTips[0], 65, lineY + 52)
    }

    ctx.fillStyle = '#E8F8F5'
    ctx.beginPath()
    ctx.roundRect(65, boxY + 190, 510, 42, 12)
    ctx.fill()
    ctx.fillStyle = '#1E8449'
    ctx.font = 'bold 13px sans-serif'
    ctx.fillText(`🧠 Status Refleksi: ${awarenessLevel}`, 80, boxY + 216)

    ctx.fillStyle = '#7F8C8D'
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('SMAN 5 SEMARANG — GERAKAN 7 KEBIASAAN ANAK INDONESIA HEBAT', 320, 885)

    const imageURI = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `Poster_7Kebiasaan_${resultTitle.replace(/[^a-zA-Z0-9]/g, '_')}.png`
    link.href = imageURI
    link.click()
  }

  // KOMPONEN KARAKTER MASKOT INTERAKTIF (TANGAN, KAKI, MELAMBAI, BERKEDIP, MELOMPAT SENANG & JEMPOL)
  const MascotSVG = ({
    variant,
    pose = 'wave',
    sizeClass = 'w-36 h-36',
  }: {
    variant?: string
    pose?: MascotPose
    sizeClass?: string
  }) => (
    <button
      type="button"
      onClick={() => {
        playSound('click')
        const poses: MascotPose[] = ['wave', 'jump', 'thumbsUp']
        const nextPose = poses[(poses.indexOf(pose) + 1) % poses.length]
        setMascotPose(nextPose)
        setMascotSpeech(MASCOT_QUOTES[Math.floor(Math.random() * MASCOT_QUOTES.length)])
      }}
      title="Ketuk Maskot untuk berganti gerakan (Melambai, Lompat Senang, Jempol)!"
      className="mx-auto block cursor-pointer focus:outline-none group"
    >
      <svg
        className={`${sizeClass} mx-auto drop-shadow-lg transition-transform ${
          pose === 'jump' ? 'mascot-jump-body' : 'group-hover:scale-105'
        }`}
        viewBox="-45 -20 290 275"
      >
        {/* Bayangan Lantai */}
        <ellipse cx="100" cy="242" rx="54" ry="9" fill="rgba(15, 23, 42, 0.25)" />

        {/* KAKI KIRI & SEPATU */}
        <g className={pose === 'jump' ? 'mascot-leg-left' : ''}>
          <rect
            x="66"
            y="182"
            width="18"
            height="36"
            rx="9"
            fill="#5E9C30"
            stroke="#3A6E1F"
            strokeWidth="3"
          />
          <path
            d="M 48 214 Q 68 205 88 214 L 88 228 Q 66 232 45 226 Q 43 218 48 214 Z"
            fill="#F59E0B"
            stroke="#B45309"
            strokeWidth="3"
          />
          <line x1="56" y1="224" x2="82" y2="224" stroke="#FFFFFF" strokeWidth="2.5" />
        </g>

        {/* KAKI KANAN & SEPATU */}
        <g className={pose === 'jump' ? 'mascot-leg-right' : ''}>
          <rect
            x="116"
            y="182"
            width="18"
            height="36"
            rx="9"
            fill="#5E9C30"
            stroke="#3A6E1F"
            strokeWidth="3"
          />
          <path
            d="M 112 214 Q 132 205 152 214 Q 157 218 155 226 Q 134 232 112 228 Z"
            fill="#F59E0B"
            stroke="#B45309"
            strokeWidth="3"
          />
          <line x1="118" y1="224" x2="144" y2="224" stroke="#FFFFFF" strokeWidth="2.5" />
        </g>

        {/* TANGAN KIRI */}
        <g className={pose === 'jump' ? 'mascot-arm-cheer-left' : ''}>
          <path
            d={
              pose === 'jump'
                ? 'M 32 118 Q -8 82 -16 54'
                : 'M 32 126 Q -4 146 -12 168'
            }
            stroke="#5E9C30"
            strokeWidth="15"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={
              pose === 'jump'
                ? 'M 32 118 Q -8 82 -16 54'
                : 'M 32 126 Q -4 146 -12 168'
            }
            stroke="#3A6E1F"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          {/* Sarung Tangan Putih Kiri */}
          <circle
            cx={pose === 'jump' ? -18 : -13}
            cy={pose === 'jump' ? 50 : 171}
            r="13"
            fill="#FFFFFF"
            stroke="#3A6E1F"
            strokeWidth="3"
          />
        </g>

        {/* BADAN DAUN KARAKTER 7 KAIH */}
        <path
          d="M 100 25 C 160 30, 185 85, 175 140 C 165 180, 135 195, 100 195 C 65 195, 35 180, 25 140 C 15 85, 40 30, 100 25 Z"
          fill="#80C242"
          stroke="#468826"
          strokeWidth="3.5"
        />
        <path d="M 100 32 L 100 188" stroke="#5E9C30" strokeWidth="2.5" opacity="0.55" />
        {/* Tunas Daun Atas */}
        <path
          d="M 100 25 C 85 10, 85 -5, 100 -5 C 115 -5, 115 10, 100 25 Z"
          fill="#80C242"
          stroke="#468826"
          strokeWidth="2.5"
        />

        {/* MATA KIRI & KANAN + ANIMASI BERKEDIP */}
        <g>
          {/* Mata Kiri */}
          <ellipse cx="72" cy="110" rx="16" ry="20" fill="#1C2D42" />
          <ellipse cx="72" cy="110" rx="14" ry="18" fill="#1E78B4" />
          <ellipse cx="72" cy="114" rx="9" ry="12" fill="#38B6FF" />
          <circle cx="67" cy="100" r="6" fill="#FFFFFF" />
          {/* Kelopak Berkedip Kiri */}
          <ellipse
            cx="72"
            cy="110"
            rx="16.5"
            ry="20.5"
            fill="#80C242"
            stroke="#468826"
            strokeWidth="2.5"
            className="mascot-eyelid"
          />

          {/* Mata Kanan */}
          <ellipse cx="128" cy="110" rx="16" ry="20" fill="#1C2D42" />
          <ellipse cx="128" cy="110" rx="14" ry="18" fill="#1E78B4" />
          <ellipse cx="128" cy="114" rx="9" ry="12" fill="#38B6FF" />
          <circle cx="123" cy="100" r="6" fill="#FFFFFF" />
          {/* Kelopak Berkedip Kanan */}
          <ellipse
            cx="128"
            cy="110"
            rx="16.5"
            ry="20.5"
            fill="#80C242"
            stroke="#468826"
            strokeWidth="2.5"
            className="mascot-eyelid"
          />
        </g>

        {/* Alis & Pipi Merona */}
        <path d="M 60 82 Q 72 76 82 84" stroke="#3A6E1F" strokeWidth="3.5" fill="none" />
        <path d="M 140 82 Q 128 76 118 84" stroke="#3A6E1F" strokeWidth="3.5" fill="none" />
        <ellipse cx="56" cy="129" rx="9" ry="5" fill="#FF7675" opacity="0.85" />
        <ellipse cx="144" cy="129" rx="9" ry="5" fill="#FF7675" opacity="0.85" />

        {/* Mulut Tersenyum Lebar */}
        <path d="M 86 126 Q 100 146 114 126 Z" fill="#D63031" />
        <path d="M 92 135 Q 100 142 108 135" fill="#FF7675" />

        {/* TANGAN KANAN DINAMIS: MELAMBAI / LOMPAT SENANG / ACUNGKAN JEMPOL */}
        {pose === 'thumbsUp' ? (
          <g className="mascot-thumb-pop">
            <path
              d="M 168 122 Q 202 115 214 96"
              stroke="#5E9C30"
              strokeWidth="15"
              strokeLinecap="round"
              fill="none"
            />
            <rect
              x="202"
              y="82"
              width="24"
              height="22"
              rx="8"
              fill="#FFFFFF"
              stroke="#3A6E1F"
              strokeWidth="3"
            />
            <rect
              x="207"
              y="62"
              width="11"
              height="24"
              rx="5.5"
              fill="#FFFFFF"
              stroke="#3A6E1F"
              strokeWidth="3"
            />
            <circle cx="229" cy="64" r="4" fill="#FACC15" />
          </g>
        ) : (
          <g className={pose === 'wave' ? 'mascot-arm-wave' : 'mascot-arm-cheer-right'}>
            <path
              d="M 168 118 Q 208 82 216 52"
              stroke="#5E9C30"
              strokeWidth="15"
              strokeLinecap="round"
              fill="none"
            />
            <circle
              cx="218"
              cy="48"
              r="14"
              fill="#FFFFFF"
              stroke="#3A6E1F"
              strokeWidth="3"
            />
            {pose === 'wave' && (
              <>
                <path
                  d="M 232 34 Q 242 46 234 58"
                  stroke="#F59E0B"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 240 29 Q 252 46 242 63"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            )}
          </g>
        )}

        {/* Aksesoris Kacamata / Bintang */}
        {variant === 'reading' && (
          <>
            <circle cx="72" cy="110" r="17" fill="none" stroke="#1E293B" strokeWidth="4" />
            <circle cx="128" cy="110" r="17" fill="none" stroke="#1E293B" strokeWidth="4" />
            <line x1="89" y1="110" x2="111" y2="110" stroke="#1E293B" strokeWidth="4" />
          </>
        )}
        {variant === 'star' && (
          <polygon
            points="100,-12 106,3 122,3 109,13 114,28 100,18 86,28 91,13 78,3 94,3"
            fill="#FACC15"
            stroke="#D97706"
            strokeWidth="1.5"
          />
        )}
      </svg>
    </button>
  )

  const currentQ = currentQuestions[currentIndex]
  const level = Math.floor(xp / 300) + 1
  const xpProgressInLevel = Math.round(((xp % 300) / 300) * 100)
  const progressPct = Math.round(((currentIndex + 1) / (currentQuestions.length || 1)) * 100)

  return (
    <div className="space-y-5 font-sans text-[#090D16]">
      {/* CSS Keyframes Khusus Gerakan Karakter */}
      <style jsx global>{`
        @keyframes mascotWave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-16deg); }
          50% { transform: rotate(12deg); }
          75% { transform: rotate(-12deg); }
        }
        @keyframes mascotBlink {
          0%, 44%, 48%, 92%, 96%, 100% { transform: scaleY(0); }
          46%, 94% { transform: scaleY(1); }
        }
        @keyframes mascotJump {
          0%, 100% { transform: translateY(0px) scale(1, 1); }
          35% { transform: translateY(-18px) scale(0.97, 1.04); }
          70% { transform: translateY(0px) scale(1.03, 0.96); }
        }
        @keyframes mascotThumbPop {
          0% { transform: scale(0.75) rotate(12deg); }
          60% { transform: scale(1.1) rotate(-6deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .mascot-arm-wave {
          transform-origin: 168px 118px;
          animation: mascotWave 1.4s ease-in-out infinite;
        }
        .mascot-eyelid {
          transform-origin: center 110px;
          animation: mascotBlink 4.2s infinite;
        }
        .mascot-jump-body {
          animation: mascotJump 0.75s ease-in-out infinite;
        }
        .mascot-thumb-pop {
          transform-origin: 168px 122px;
          animation: mascotThumbPop 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      {/* Element Canvas Tersembunyi untuk Poster PNG */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Game HUD Bar */}
      <header className="kaih-glass-card flex flex-wrap items-center justify-between p-4 px-5 sm:px-6 rounded-3xl gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-white flex items-center justify-center font-black shadow-sm">
            <Trophy size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-extrabold uppercase text-slate-700">
                Status Karakter • {totalPlayers.toLocaleString('id-ID')} Sesi Selesai
              </p>
              {combo >= 2 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black animate-pulse">
                  <Flame size={11} /> {combo}x Combo!
                </span>
              )}
            </div>
            <p className="font-heading text-sm font-black text-[#090D16] flex items-center gap-2">
              <span>Level {level}</span>
              <span className="text-slate-400">•</span>
              <span className="text-indigo-700">{xp} XP</span>
            </p>
            <div className="w-32 h-1.5 bg-slate-200/90 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-sky-500 transition-all duration-300"
                style={{ width: `${xpProgressInLevel}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-indigo-100/90 border border-indigo-200 text-indigo-900 px-3.5 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-1.5">
            <Clock size={14} />
            <span>{timerText}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold bg-white/90 border border-white hover:bg-white text-[#090D16] transition-all cursor-pointer shadow-2xs"
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            <span className="hidden sm:inline">{isMuted ? 'Audio Off' : 'Audio On'}</span>
          </button>
        </div>
      </header>

      {/* 1. LAYAR UTAMA (START LOBBY) */}
      {screen === 'start' && (
        <div className="rounded-[2rem] bg-gradient-to-br from-indigo-950 via-indigo-900 to-sky-800 text-white p-7 sm:p-10 shadow-2xl border border-indigo-400/20 relative overflow-hidden text-center space-y-6">
          {nexaraLogoUrl && (
            <img
              src={nexaraLogoUrl}
              alt="Nexara Background"
              className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none"
            />
          )}

          <div className="relative z-10 space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/20 text-sky-200 text-xs font-extrabold">
              <Sparkles size={14} className="text-sky-300" />
              <span>7 KAIH HABIT QUEST • {slotThemeLabel}</span>
            </div>

            {/* Maskot Lengkap Tangan & Kaki + Tombol Tes Gerakan */}
            <div className="space-y-3">
              <MascotSVG pose={mascotPose} sizeClass="w-40 h-40" />

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playSound('click')
                    setMascotPose('wave')
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold border transition-all cursor-pointer ${
                    mascotPose === 'wave'
                      ? 'bg-sky-400 text-indigo-950 border-sky-300'
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  }`}
                >
                  <Hand size={13} />
                  <span>Melambai</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound('combo')
                    setMascotPose('jump')
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold border transition-all cursor-pointer ${
                    mascotPose === 'jump'
                      ? 'bg-sky-400 text-indigo-950 border-sky-300'
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  }`}
                >
                  <Sparkles size={13} />
                  <span>Lompat Senang</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound('click')
                    setMascotPose('thumbsUp')
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold border transition-all cursor-pointer ${
                    mascotPose === 'thumbsUp'
                      ? 'bg-sky-400 text-indigo-950 border-sky-300'
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  }`}
                >
                  <ThumbsUp size={13} />
                  <span>Jempol Mantap</span>
                </button>
              </div>
            </div>

            <div className="max-w-md mx-auto bg-indigo-950/60 border border-white/20 rounded-2xl px-4 py-2.5 text-xs text-indigo-100 font-semibold">
              "{mascotSpeech}"
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-tight text-white">
                Temukan Tipe Kebiasaan Hebatmu!
              </h1>
              <p className="text-sm text-indigo-100 leading-relaxed">
                Jawab 10 pertanyaan simulasi harian sesuai rotasi waktu, kumpulkan poin XP &
                Combo Bonus, dan dapatkan Poster Karakter PNG serta tips kebiasaan personalmu!
              </p>
            </div>

            {/* Strip Ikon 7 Pilar */}
            <div className="flex items-center justify-center gap-2">
              {[Sunrise, HeartHandshake, Dumbbell, Apple, BookOpenCheck, Users, MoonStar].map(
                (Icon, idx) => (
                  <span
                    key={idx}
                    className="h-8 w-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-sky-200"
                  >
                    <Icon size={15} />
                  </span>
                )
              )}
            </div>

            {/* 3 Kartu Preview Karakter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
              <div className="bg-indigo-950/55 p-4 rounded-2xl border border-white/15">
                <ShieldCheck size={20} className="text-amber-300 mb-1.5" />
                <p className="text-xs font-extrabold text-white">Pelopor Disiplin</p>
                <p className="text-[11px] text-indigo-200 mt-0.5">
                  Bangun pagi, olahraga & hidup teratur
                </p>
              </div>
              <div className="bg-indigo-950/55 p-4 rounded-2xl border border-white/15">
                <BookOpen size={20} className="text-sky-300 mb-1.5" />
                <p className="text-xs font-extrabold text-white">Pembelajar Sejati</p>
                <p className="text-[11px] text-indigo-200 mt-0.5">
                  Gemar membaca & rasa ingin tahu tinggi
                </p>
              </div>
              <div className="bg-indigo-950/55 p-4 rounded-2xl border border-white/15">
                <Users size={20} className="text-emerald-300 mb-1.5" />
                <p className="text-xs font-extrabold text-white">Bintang Gotong Royong</p>
                <p className="text-[11px] text-indigo-200 mt-0.5">
                  Peduli sesama & aktif bermasyarakat
                </p>
              </div>
            </div>

            <div className="max-w-md mx-auto pt-2 space-y-2.5">
              <button
                type="button"
                onClick={startGame}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400 hover:scale-[1.02] text-indigo-950 font-black py-4 rounded-2xl shadow-lg transition-all text-base cursor-pointer"
              >
                <Zap size={20} />
                <span>Mulai Kuis Sekarang 🚀</span>
              </button>
              <p className="text-[11px] text-indigo-100 flex items-center justify-center gap-1.5">
                <Star size={12} className="text-sky-300" />
                <span>Tips: Jawab di bawah 8 detik untuk meraih Speed Bonus & Combo XP!</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. LAYAR KUIS INTERAKTIF (QUIZ) */}
      {screen === 'quiz' && (
        <div className="kaih-glass-card rounded-3xl p-5 sm:p-9 space-y-6">
          <div className="space-y-3 max-w-2xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-extrabold">
              <span className="text-indigo-800">
                Tantangan {currentIndex + 1} dari {currentQuestions.length || 10}
              </span>
              <div className="flex items-center gap-2">
                {combo >= 2 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold">
                    🔥 Streak {combo}x
                  </span>
                )}
                <span className="text-slate-700">{progressPct}% Selesai</span>
              </div>
            </div>

            <div className="w-full bg-slate-200/90 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Mini Live Habit Meter */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-indigo-100/80 border border-indigo-200 px-3 py-1.5 rounded-xl flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-800">Teratur</span>
                <span className="font-black text-indigo-800">{scores['Teratur'] || 0}</span>
              </div>
              <div className="bg-sky-100/80 border border-sky-200 px-3 py-1.5 rounded-xl flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-800">Membaca</span>
                <span className="font-black text-sky-800">{scores['Gemar Membaca'] || 0}</span>
              </div>
              <div className="bg-emerald-100/80 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-800">Gotong Royong</span>
                <span className="font-black text-emerald-800">
                  {(scores['Gotong Royong'] || 0) + (scores['Sosial'] || 0)}
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="text-center italic text-slate-800 font-semibold py-14 animate-pulse">
              Menyiapkan arena soal dari database...
            </p>
          ) : currentQ ? (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center gap-4 bg-white/90 p-4 rounded-2xl border border-white">
                <div className="shrink-0">
                  <MascotSVG pose={mascotPose} sizeClass="w-24 h-24" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
                    Pendamping 7 KAIH
                  </span>
                  <p className="text-xs sm:text-sm text-[#090D16] font-semibold leading-relaxed">
                    {mascotSpeech}
                  </p>
                </div>
              </div>

              <h2 className="font-heading text-lg sm:text-xl font-extrabold text-[#090D16] text-center min-h-[64px] flex items-center justify-center leading-snug">
                {currentQ.pertanyaan}
              </h2>

              <div className="flex flex-col gap-3.5">
                {[
                  { key: 'A', opt: currentQ.opsi_a },
                  { key: 'B', opt: currentQ.opsi_b },
                  { key: 'C', opt: currentQ.opsi_c },
                ].map(({ key, opt }) => {
                  const isSelected = selectedChoiceKey === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => selectOption(key, opt)}
                      className={`habit-folder-card w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 scale-[1.01] shadow-md'
                          : 'border-white bg-white/90 hover:border-indigo-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center font-black text-sm ${
                            isSelected
                              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
                              : 'bg-indigo-950 text-white'
                          }`}
                        >
                          {key}
                        </span>
                        <span className="text-sm sm:text-base font-bold text-[#090D16]">
                          {opt.text}
                        </span>
                      </div>

                      {isSelected && (
                        <span className="shrink-0 inline-flex items-center gap-1 text-xs font-extrabold text-indigo-800 bg-indigo-100 px-3 py-1 rounded-full">
                          <CheckCircle2 size={14} /> +{lastEarnedXp} XP
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              <p className="hidden sm:flex items-center justify-center gap-1.5 text-[11px] text-slate-700 font-semibold">
                <Keyboard size={13} />
                <span>Gunakan tombol keyboard A, B, atau C untuk memilih lebih cepat</span>
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* 3. LAYAR HASIL LENGKAP (RESULT + POSTER PNG + TIPS + RINGKASAN) */}
      {screen === 'result' && (
        <div className="kaih-glass-card rounded-3xl p-6 sm:p-10 space-y-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-3">
              <MascotSVG
                variant={resultTitle.includes('Cerdas') ? 'reading' : 'star'}
                pose="thumbsUp"
                sizeClass="w-36 h-36"
              />
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-indigo-100 border border-indigo-200 text-indigo-900 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase">
                  <Zap size={13} /> Total {xp} XP
                </span>
                {maxCombo >= 2 && (
                  <span className="inline-flex items-center gap-1 bg-amber-100 border border-amber-300 text-amber-900 px-3.5 py-1.5 rounded-full text-xs font-extrabold">
                    <Flame size={13} /> Rekor Combo {maxCombo}x
                  </span>
                )}
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#090D16]">
                {resultTitle}
              </h2>
              <div className="bg-white/90 border border-white p-4 rounded-2xl text-xs sm:text-sm text-[#090D16] font-medium leading-relaxed">
                {resultDesc}
              </div>
            </div>

            {/* RINCIAN SKOR HABIT */}
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(scores).map(([habitName, val]) => (
                <div
                  key={habitName}
                  className="bg-white/90 border border-white p-3.5 rounded-2xl text-center"
                >
                  <p className="text-[11px] font-extrabold text-slate-700">{habitName}</p>
                  <p className="font-heading text-xl font-black text-indigo-700 mt-0.5">
                    {val * 10}%
                  </p>
                </div>
              ))}
            </div>

            {/* BADGE KESADARAN DIRI */}
            <div className="bg-violet-100/90 border border-violet-200 rounded-2xl p-4 text-center space-y-1">
              <p className="text-violet-800 text-xs font-extrabold uppercase tracking-wider">
                🧠 Indikator Refleksi Kebiasaan
              </p>
              <p className="text-sm font-extrabold text-violet-950">
                Pola Karakter: <span className="text-violet-700">{awarenessLevel}</span>
              </p>
              <p className="text-xs text-slate-800 font-medium leading-normal">{awarenessDesc}</p>
            </div>

            {/* KARTU STATISTIK KOMUNITAS REAL-TIME */}
            {communityPercentage !== null && (
              <div className="rounded-2xl bg-gradient-to-r from-indigo-950 via-indigo-800 to-sky-700 text-white p-5 text-center space-y-1 shadow-md">
                <p className="text-xs font-extrabold text-sky-200 uppercase tracking-wider">
                  📊 Statistik Teman Sekolah
                </p>
                <p className="text-base sm:text-lg font-black">
                  <span className="text-sky-300 text-xl font-black">
                    {communityPercentage}%
                  </span>{' '}
                  siswa SMAN 5 Semarang juga bertipe {resultTitle}!
                </p>
                <p className="text-[11px] text-indigo-100 italic">
                  (Dihitung dari {totalPlayers.toLocaleString('id-ID')} total penyelesaian kuis)
                </p>
              </div>
            )}

            {/* SARAN PERSONAL */}
            <div className="bg-white/90 border border-white rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-extrabold text-indigo-800 uppercase tracking-wider">
                📌 Tips Kebiasaan Buat Kamu
              </h3>
              <ul className="space-y-2">
                {personalTips.map((tip, idx) => (
                  <li
                    key={idx}
                    className="text-xs sm:text-sm text-[#090D16] font-medium leading-normal"
                  >
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* RINGKASAN JAWABAN SISWA */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                📝 Ringkasan Jawaban Kamu ({userAnswers.length} Soal)
              </h3>
              <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1 text-left">
                {userAnswers.map((ans, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-white/90 rounded-xl border border-white space-y-1"
                  >
                    <p className="text-xs font-extrabold text-[#090D16]">
                      {idx + 1}. {ans.questionText}
                    </p>
                    <p className="text-xs font-bold text-indigo-800 bg-indigo-100/80 py-1 px-2.5 rounded-lg inline-block">
                      Pilihanmu: {ans.selectedOptionText}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* TOMBOL AKSI */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/survey?result_id=${savedResultId || ''}&profile=${encodeURIComponent(resultTitle)}`
                  )
                }
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 hover:opacity-95 text-white font-extrabold py-4 rounded-2xl shadow-md transition-all text-sm cursor-pointer"
              >
                <span>Lanjutkan ke Web Survei Utama</span>
                <ArrowRight size={16} />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={downloadResultCard}
                  className="w-full inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold py-3.5 rounded-2xl transition-all text-xs shadow-sm cursor-pointer"
                >
                  <Download size={15} />
                  <span>Unduh Poster (PNG)</span>
                </button>

                <button
                  type="button"
                  onClick={copyShareText}
                  className="w-full inline-flex items-center justify-center gap-2 bg-indigo-950 hover:bg-indigo-900 text-white font-extrabold py-3.5 rounded-2xl transition-all text-xs shadow-sm cursor-pointer"
                >
                  <Share2 size={15} />
                  <span>{copiedText ? '✅ Teks Disalin!' : 'Salin Teks Profil'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={startGame}
                className="w-full inline-flex items-center justify-center gap-2 bg-white/95 border-2 border-indigo-200 hover:bg-indigo-50 text-indigo-800 font-extrabold py-3 rounded-2xl transition-all text-sm cursor-pointer"
              >
                <RotateCcw size={15} />
                <span>Ulangi Kuis</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}