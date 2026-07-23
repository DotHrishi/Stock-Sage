'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface PollingOptions {
    intervalMs?: number   // default 30 000 ms
    enabled?: boolean
}

interface PollingState<T> {
    data: T | null
    loading: boolean
    error: string | null
    updatedAt: number | null
    refresh: () => void
}

export function usePolling<T>(
    url: string,
    initial: T | null = null,
    { intervalMs = 30_000, enabled = true }: PollingOptions = {}
): PollingState<T> {
    const [data, setData] = useState<T | null>(initial)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [updatedAt, setUpdatedAt] = useState<number | null>(null)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const mountedRef = useRef(true)

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(url, { cache: 'no-store' })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const json = await res.json()
            if (!mountedRef.current) return

            // Support both response shapes:
            //   Legacy:  { data: T, updatedAt: number }  — used by /api/market/* routes
            //   Direct:  { ...T, updatedAt: number }     — used by /api/stock/* routes
            if (json?.error) {
                throw new Error(typeof json.error === 'string' ? json.error : 'Failed')
            }
            const payload: T = ('data' in json && json.data !== undefined) ? json.data : json
            setData(payload)
            setUpdatedAt(json.updatedAt ?? Date.now())
            setError(null)
        } catch (err: any) {
            if (!mountedRef.current) return
            console.error('Polling error:', err)
            setError(err.message ?? 'Failed to fetch')
        } finally {
            if (mountedRef.current) setLoading(false)
        }
    }, [url])

    // Kick off initial fetch + schedule interval
    useEffect(() => {
        if (!enabled) return
        mountedRef.current = true
        fetchData()

        timerRef.current = setInterval(fetchData, intervalMs)
        return () => {
            mountedRef.current = false
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [fetchData, intervalMs, enabled])

    return { data, loading, error, updatedAt, refresh: fetchData }
}
