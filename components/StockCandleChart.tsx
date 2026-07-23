'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
    createChart,
    ColorType,
    CrosshairMode,
    LineStyle,
    type IChartApi,
    type ISeriesApi,
    type Time,
    type CandlestickData,
    type LineData,
    type HistogramData,
    type AreaData,
} from 'lightweight-charts'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CandlePoint {
    time: string
    open: number
    high: number
    low: number
    close: number
}

export interface VolumePoint {
    time: string
    value: number
    color: string
}

type ChartType = 'candle' | 'line' | 'area'
type RangeKey = '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y'

interface HoveredBar {
    time: string
    open: number
    high: number
    low: number
    close: number
    change: string
    changePct: string
    volume?: number
    isUp: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RANGE_PARAMS: Record<RangeKey, { range: string }> = {
    '1W': { range: '5d' },
    '1M': { range: '1mo' },
    '3M': { range: '3mo' },
    '6M': { range: '6mo' },
    '1Y': { range: '1y' },
    '5Y': { range: '5y' },
}

const CHART_BG = '#000000'
const CHART_GRID = '#1e293b'
const CHART_TEXT = '#94a3b8'
const UP_COLOR = '#14b8a6'    // teal
const DOWN_COLOR = '#f43f5e'  // rose

// ─── MA Calculation ───────────────────────────────────────────────────────────

function calcSMA(data: CandlePoint[], period: number): LineData[] {
    const out: LineData[] = []
    for (let i = period - 1; i < data.length; i++) {
        let sum = 0
        for (let j = 0; j < period; j++) sum += data[i - j].close
        out.push({ time: data[i].time as Time, value: parseFloat((sum / period).toFixed(2)) })
    }
    return out
}

// ─── Format helpers ───────────────────────────────────────────────────────────

const fmtNum = (n: number) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(n)

const fmtVol = (v: number) => {
    if (v >= 1_00_00_000) return `${(v / 1_00_00_000).toFixed(2)}Cr`
    if (v >= 1_00_000) return `${(v / 1_00_000).toFixed(2)}L`
    if (v >= 1_000) return `${(v / 1_000).toFixed(2)}K`
    return String(v)
}

// ─── Chart Options ────────────────────────────────────────────────────────────

const baseChartOptions = (width: number) => ({
    width,
    height: 420,
    layout: {
        background: { type: ColorType.Solid, color: CHART_BG },
        textColor: CHART_TEXT,
        fontFamily: "'Work Sans', sans-serif",
        fontSize: 11,
    },
    grid: {
        vertLines: { color: CHART_GRID, style: LineStyle.Solid },
        horzLines: { color: CHART_GRID, style: LineStyle.Solid },
    },
    crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#475569', width: 1 as any, style: LineStyle.Dashed, labelBackgroundColor: '#1e293b' },
        horzLine: { color: '#475569', width: 1 as any, style: LineStyle.Dashed, labelBackgroundColor: '#1e293b' },
    },
    rightPriceScale: {
        borderColor: '#1e293b',
        textColor: CHART_TEXT,
        borderVisible: true,
        scaleMargins: { top: 0.1, bottom: 0.25 },
    },
    timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 8,
        barSpacing: 8,
        fixLeftEdge: false,
        fixRightEdge: false,
    },
    handleScroll: true,
    handleScale: true,
})

const candlestickOptions = {
    upColor: UP_COLOR,
    downColor: DOWN_COLOR,
    borderUpColor: UP_COLOR,
    borderDownColor: DOWN_COLOR,
    wickUpColor: UP_COLOR,
    wickDownColor: DOWN_COLOR,
    borderVisible: true,
}

const areaOptions = {
    lineColor: UP_COLOR,
    topColor: 'rgba(20,184,166,0.35)',
    bottomColor: 'rgba(20,184,166,0.02)',
    lineWidth: 2 as const,
    priceLineVisible: false,
}

const lineOptions = {
    color: UP_COLOR,
    lineWidth: 2 as const,
    priceLineVisible: false,
    lastValueVisible: true,
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface StockCandleChartProps {
    symbol: string // e.g. "TCS.NS"
}

export default function StockCandleChart({ symbol }: StockCandleChartProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const mainRef = useRef<ISeriesApi<any> | null>(null)
    const volumeRef = useRef<ISeriesApi<'Histogram'> | null>(null)
    const ma20Ref = useRef<ISeriesApi<'Line'> | null>(null)
    const ma50Ref = useRef<ISeriesApi<'Line'> | null>(null)
    const ma200Ref = useRef<ISeriesApi<'Line'> | null>(null)

    const [range, setRange] = useState<RangeKey>('1Y')
    const [chartType, setChartType] = useState<ChartType>('candle')
    const [showMA, setShowMA] = useState({ ma20: true, ma50: true, ma200: false })
    const [loading, setLoading] = useState(true)
    const [candles, setCandles] = useState<CandlePoint[]>([])
    const [volumes, setVolumes] = useState<VolumePoint[]>([])
    const [hovered, setHovered] = useState<HoveredBar | null>(null)
    const [periodReturn, setPeriodReturn] = useState<{ pct: string; isUp: boolean } | null>(null)

    // ── Fetch data ────────────────────────────────────────────────────────────

    const fetchData = useCallback(async (r: RangeKey) => {
        setLoading(true)
        try {
            const { range: yfRange } = RANGE_PARAMS[r]
            const res = await fetch(`/api/stock/${encodeURIComponent(symbol)}/history?range=${yfRange}`, { cache: 'no-store' })
            if (!res.ok) throw new Error('fetch failed')
            const json = await res.json()
            setCandles(json.candles ?? [])
            setVolumes(json.volumes ?? [])

            // Period return
            const cs: CandlePoint[] = json.candles ?? []
            if (cs.length >= 2) {
                const first = cs[0].close, last = cs[cs.length - 1].close
                const pct = ((last - first) / first * 100).toFixed(2)
                setPeriodReturn({ pct: `${pct}%`, isUp: last >= first })
            }
        } catch (e) {
            console.error('chart fetch error:', e)
        } finally {
            setLoading(false)
        }
    }, [symbol])

    useEffect(() => { fetchData(range) }, [range, fetchData])

    // ── Chart init (mount only) ───────────────────────────────────────────────

    useEffect(() => {
        if (!containerRef.current) return

        const chart = createChart(containerRef.current, baseChartOptions(containerRef.current.clientWidth))
        chartRef.current = chart

        // Volume series (always present, behind main series using scaleMargins)
        const vol = chart.addHistogramSeries({
            priceFormat: { type: 'volume' },
            priceScaleId: 'vol',
        })
        chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.78, bottom: 0 } })
        volumeRef.current = vol

        // Main candle series (default)
        const candle = chart.addCandlestickSeries(candlestickOptions)
        mainRef.current = candle

        // Crosshair tooltip
        chart.subscribeCrosshairMove((param) => {
            if (!param.time || !param.seriesData) {
                setHovered(null)
                return
            }
            const raw = param.seriesData.get(candle) as any
            if (!raw) { setHovered(null); return }

            const c = raw.close ?? raw.value ?? 0
            const o = raw.open ?? c
            const h = raw.high ?? c
            const l = raw.low ?? c
            const ch = c - o
            const chPct = o !== 0 ? (ch / o * 100) : 0
            setHovered({
                time: typeof param.time === 'string' ? param.time : new Date((param.time as number) * 1000).toISOString().slice(0, 10),
                open: o, high: h, low: l, close: c,
                change: `${ch >= 0 ? '+' : ''}${ch.toFixed(2)}`,
                changePct: `${chPct >= 0 ? '+' : ''}${chPct.toFixed(2)}%`,
                isUp: ch >= 0,
            })
        })

        // Responsive resize
        const observer = new ResizeObserver(() => {
            if (containerRef.current && chartRef.current) {
                chartRef.current.resize(containerRef.current.clientWidth, 420)
            }
        })
        observer.observe(containerRef.current)

        return () => {
            observer.disconnect()
            chart.remove()
            chartRef.current = null
            mainRef.current = null
            volumeRef.current = null
            ma20Ref.current = null
            ma50Ref.current = null
            ma200Ref.current = null
        }
    }, []) // mount only

    // ── Update series data when candles change ───────────────────────────────

    useEffect(() => {
        const chart = chartRef.current
        if (!chart || !candles.length) return

        // Volume
        if (volumeRef.current) {
            volumeRef.current.setData(volumes.map(v => ({ ...v, time: v.time as Time })))
        }

        // Main series — update data based on current type
        if (mainRef.current) {
            if (chartType === 'candle') {
                mainRef.current.setData(candles.map(c => ({ ...c, time: c.time as Time })) as CandlestickData[])
            } else {
                mainRef.current.setData(candles.map(c => ({ time: c.time as Time, value: c.close })) as (LineData | AreaData)[])
            }
        }

        // MA series
        const updateMA = (ref: React.MutableRefObject<ISeriesApi<'Line'> | null>, period: number) => {
            if (!ref.current) return
            ref.current.setData(calcSMA(candles, period))
        }
        updateMA(ma20Ref, 20)
        updateMA(ma50Ref, 50)
        updateMA(ma200Ref, 200)

        chart.timeScale().fitContent()
    }, [candles, volumes]) // eslint-disable-line

    // ── Chart type switching ──────────────────────────────────────────────────

    const switchChartType = useCallback((type: ChartType) => {
        const chart = chartRef.current
        if (!chart) return

        if (mainRef.current) { chart.removeSeries(mainRef.current); mainRef.current = null }

        let series: ISeriesApi<any>
        if (type === 'candle') {
            series = chart.addCandlestickSeries(candlestickOptions)
            if (candles.length) series.setData(candles.map(c => ({ ...c, time: c.time as Time })) as CandlestickData[])
        } else if (type === 'line') {
            series = chart.addLineSeries(lineOptions)
            if (candles.length) series.setData(candles.map(c => ({ time: c.time as Time, value: c.close })) as LineData[])
        } else {
            series = chart.addAreaSeries(areaOptions)
            if (candles.length) series.setData(candles.map(c => ({ time: c.time as Time, value: c.close })) as AreaData[])
        }
        mainRef.current = series
        setChartType(type)

        // Re-subscribe crosshair with new series
        chart.subscribeCrosshairMove((param) => {
            if (!param.time || !param.seriesData) { setHovered(null); return }
            const raw = param.seriesData.get(series) as any
            if (!raw) { setHovered(null); return }
            const c = raw.close ?? raw.value ?? 0
            const o = raw.open ?? c
            const h = raw.high ?? c
            const l = raw.low ?? c
            const ch = c - o
            const chPct = o !== 0 ? (ch / o * 100) : 0
            setHovered({
                time: typeof param.time === 'string' ? param.time : new Date((param.time as number) * 1000).toISOString().slice(0, 10),
                open: o, high: h, low: l, close: c,
                change: `${ch >= 0 ? '+' : ''}${ch.toFixed(2)}`,
                changePct: `${chPct >= 0 ? '+' : ''}${chPct.toFixed(2)}%`,
                isUp: ch >= 0,
            })
        })
    }, [candles])

    // ── MA toggle ────────────────────────────────────────────────────────────

    const toggleMA = useCallback((key: 'ma20' | 'ma50' | 'ma200') => {
        const chart = chartRef.current
        if (!chart) return
        const period = key === 'ma20' ? 20 : key === 'ma50' ? 50 : 200
        const refMap = { ma20: ma20Ref, ma50: ma50Ref, ma200: ma200Ref }
        const colorMap = { ma20: '#22d3ee', ma50: '#fb923c', ma200: '#a78bfa' }
        const ref = refMap[key]

        if (ref.current) {
            chart.removeSeries(ref.current)
            ref.current = null
            setShowMA(prev => ({ ...prev, [key]: false }))
        } else {
            const s = chart.addLineSeries({
                color: colorMap[key],
                lineWidth: 1,
                priceLineVisible: false,
                lastValueVisible: false,
            })
            if (candles.length) s.setData(calcSMA(candles, period))
            ref.current = s
            setShowMA(prev => ({ ...prev, [key]: true }))
        }
    }, [candles])

    // ── Init MA series based on default showMA state ──────────────────────────
    useEffect(() => {
        const chart = chartRef.current
        if (!chart || !candles.length) return
        if (showMA.ma20 && !ma20Ref.current) {
            const s = chart.addLineSeries({ color: '#22d3ee', lineWidth: 1, priceLineVisible: false, lastValueVisible: false })
            s.setData(calcSMA(candles, 20)); ma20Ref.current = s
        }
        if (showMA.ma50 && !ma50Ref.current) {
            const s = chart.addLineSeries({ color: '#fb923c', lineWidth: 1, priceLineVisible: false, lastValueVisible: false })
            s.setData(calcSMA(candles, 50)); ma50Ref.current = s
        }
    }, [candles]) // eslint-disable-line

    // ─── Render ───────────────────────────────────────────────────────────────

    const RANGES: RangeKey[] = ['1W', '1M', '3M', '6M', '1Y', '5Y']

    return (
        <div className="bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
            {/* ── Controls Bar ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-800/80">
                {/* Range selector */}
                <div className="flex items-center gap-1 bg-slate-900/60 rounded-lg p-1">
                    {RANGES.map(r => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                                range === r
                                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {/* Period return badge */}
                    {periodReturn && (
                        <span className={`text-xs font-bold px-2 py-0.5 ${
                            periodReturn.isUp ? 'text-green-500' : 'text-red-500'
                        }`}>
                            {periodReturn.isUp ? '▲' : '▼'} {periodReturn.pct} ({range})
                        </span>
                    )}

                    {/* Chart type */}
                    <div className="flex items-center gap-1 bg-slate-900/60 rounded-lg p-1">
                        {([
                            { type: 'candle', label: 'Candle' },
                            { type: 'line', label: 'Line' },
                            { type: 'area', label: 'Area' },
                        ] as { type: ChartType; label: string }[]).map(({ type, label }) => (
                            <button
                                key={type}
                                onClick={() => switchChartType(type)}
                                title={type}
                                className={`px-2.5 py-1 text-sm rounded-md transition-all ${
                                    chartType === type
                                        ? 'bg-slate-600 text-white'
                                        : 'text-slate-500 hover:text-white hover:bg-slate-700'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* MA toggles */}
                    <div className="flex items-center gap-1">
                        {([
                            { key: 'ma20', label: 'MA20', color: 'bg-cyan-400' },
                            { key: 'ma50', label: 'MA50', color: 'bg-orange-400' },
                            { key: 'ma200', label: 'MA200', color: 'bg-violet-400' },
                        ] as { key: 'ma20' | 'ma50' | 'ma200'; label: string; color: string }[]).map(({ key, label, color }) => (
                            <button
                                key={key}
                                onClick={() => toggleMA(key)}
                                className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-md border transition-all ${
                                    showMA[key]
                                        ? 'border-slate-500 bg-slate-700 text-white'
                                        : 'border-slate-700 bg-transparent text-slate-600 hover:border-slate-500 hover:text-slate-400'
                                }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${showMA[key] ? color : 'bg-slate-600'}`} />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Crosshair Tooltip ── */}
            <div className="relative">
                {hovered && (
                    <div className="absolute top-3 left-4 z-10 bg-slate-900/95 backdrop-blur-sm border border-slate-700/80 rounded-lg px-3 py-2 shadow-2xl pointer-events-none">
                        <p className="text-[10px] text-slate-500 mb-1.5 font-medium">{hovered.time}</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px]">
                            {[['O', hovered.open], ['H', hovered.high], ['L', hovered.low], ['C', hovered.close]].map(([label, val]) => (
                                <div key={label as string} className="flex items-center gap-1.5">
                                    <span className="text-slate-500 font-medium w-3">{label}</span>
                                    <span className={`font-semibold tabular-nums ${label === 'C' ? (hovered.isUp ? 'text-teal-400' : 'text-rose-400') : 'text-slate-200'}`}>
                                        {fmtNum(val as number)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className={`text-[11px] font-bold mt-1.5 ${hovered.isUp ? 'text-teal-400' : 'text-rose-400'}`}>
                            {hovered.change} ({hovered.changePct})
                        </div>
                    </div>
                )}

                {/* ── Chart Canvas ── */}
                <div ref={containerRef} className="w-full" style={{ height: 420 }} />

                {/* ── Loading overlay ── */}
                {loading && (
                    <div className="absolute inset-0 bg-[#0b0f1a]/80 backdrop-blur-sm flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs text-slate-400">Loading chart…</span>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Legend ── */}
            <div className="flex items-center justify-between px-5 py-2.5 border-t border-slate-800/60 bg-slate-900/40">
                <div className="flex items-center gap-4 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-teal-500 inline-block rounded" /> Bullish</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-rose-500 inline-block rounded" /> Bearish</span>
                    {showMA.ma20 && <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-cyan-400 inline-block rounded" /> MA20</span>}
                    {showMA.ma50 && <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-orange-400 inline-block rounded" /> MA50</span>}
                    {showMA.ma200 && <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-violet-400 inline-block rounded" /> MA200</span>}
                </div>
                <span className="text-[10px] text-slate-600">Powered by TradingView Lightweight Charts</span>
            </div>
        </div>
    )
}
