'use client'

import { Compass } from 'lucide-react'

type DimensionScore = {
  label: string
  score: number
  target: number
}

const DEFAULT_DIMENSIONS: DimensionScore[] = [
  { label: 'Bangun Pagi', score: 0, target: 4.5 },
  { label: 'Beribadah', score: 0, target: 4.5 },
  { label: 'Berolahraga', score: 0, target: 4.2 },
  { label: 'Makan Sehat', score: 0, target: 4.3 },
  { label: 'Gemar Belajar', score: 0, target: 4.3 },
  { label: 'Bermasyarakat', score: 0, target: 4.4 },
  { label: 'Tidur Cepat', score: 0, target: 4.2 },
]

export default function RadarChart7KAIH({
  dimensions,
  title = 'Peta Radar 7 KAIH',
  subtitle = 'Keseimbangan 7 dimensi karakter siswa SMAN 5',
}: {
  dimensions?: DimensionScore[]
  title?: string
  subtitle?: string
}) {
  const safeDimensions =
    Array.isArray(dimensions) && dimensions.length > 0
      ? dimensions.map((d: any, idx: number) => ({
          label: d?.label || DEFAULT_DIMENSIONS[idx]?.label || `Dimensi ${idx + 1}`,
          score: Number(d?.score ?? d?.value ?? 0) || 0,
          target: Number(d?.target ?? 4.5) || 4.5,
        }))
      : DEFAULT_DIMENSIONS

  const size = 300
  const center = size / 2
  const maxRadius = 92
  const levels = [1, 2, 3, 4, 5]
  const totalAxes = safeDimensions.length

  const getCoordinates = (value: number, index: number) => {
    const angle = (Math.PI * 2 * index) / totalAxes - Math.PI / 2
    const clamped = Math.min(5, Math.max(0, Number(value) || 0))
    const r = (clamped / 5) * maxRadius
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    }
  }

  const actualPoints = safeDimensions
    .map((d, i) => {
      const { x, y } = getCoordinates(d.score, i)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  const targetPoints = safeDimensions
    .map((d, i) => {
      const { x, y } = getCoordinates(d.target, i)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div>
          <h3 className="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2">
            <Compass size={19} className="text-indigo-600 shrink-0" />
            <span>{title}</span>
          </h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-bold">
          <span className="flex items-center gap-1.5 text-indigo-700">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
            Aktual
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-purple-400 border-dashed inline-block" />
            Target
          </span>
        </div>
      </div>

      <div className="w-full flex items-center justify-center my-1">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[310px] h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.42" />
              <stop offset="100%" stopColor="#9333ea" stopOpacity="0.22" />
            </linearGradient>
          </defs>

          {levels.map((lvl) => {
            const poly = safeDimensions
              .map((_, i) => {
                const { x, y } = getCoordinates(lvl, i)
                return `${x.toFixed(1)},${y.toFixed(1)}`
              })
              .join(' ')
            return (
              <polygon
                key={lvl}
                points={poly}
                fill={lvl === 5 ? '#f8fafc' : 'none'}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            )
          })}

          {safeDimensions.map((_, i) => {
            const { x, y } = getCoordinates(5, i)
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            )
          })}

          <polygon
            points={targetPoints}
            fill="none"
            stroke="#a855f7"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          <polygon
            points={actualPoints}
            fill="url(#radarFill)"
            stroke="#4f46e5"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {safeDimensions.map((d, i) => {
            const pt = getCoordinates(d.score, i)
            const labelPt = getCoordinates(6.15, i)
            return (
              <g key={d.label}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill="#4f46e5"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <text
                  x={labelPt.x}
                  y={labelPt.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-700 text-[9.5px] font-bold"
                >
                  {d.label}
                </text>
                <text
                  x={labelPt.x}
                  y={labelPt.y + 11}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-indigo-600 text-[9px] font-extrabold"
                >
                  {d.score.toFixed(1)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
        {safeDimensions.slice(0, 3).map((d) => (
          <div key={d.label} className="bg-slate-50 rounded-xl py-2 px-1">
            <p className="text-[10px] text-slate-500 truncate">{d.label}</p>
            <p className="text-xs font-extrabold text-indigo-700">{d.score.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}