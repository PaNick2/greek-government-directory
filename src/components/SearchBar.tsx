'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface SearchResult {
  slug: string
  name: string
  name_en: string | null
  currentRole: string | null
  partyName: string | null
}

interface SearchBarProps {
  placeholder?: string
  size?: 'sm' | 'lg'
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

export default function SearchBar({
  placeholder = 'Αναζήτηση υπουργού...',
  size = 'sm',
}: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  // Fetch results
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    setLoading(true)
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data) => {
        setResults(data.results ?? [])
        setOpen(true)
      })
      .catch(() => {
        setResults([])
      })
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && query.trim()) {
        router.push(`/ministers?q=${encodeURIComponent(query.trim())}`)
        setOpen(false)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    },
    [query, router]
  )

  const inputClass =
    size === 'lg'
      ? 'w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-base shadow-sm placeholder:text-slate-400 focus:border-[#003087] focus:ring-2 focus:ring-[#003087]/20 outline-none transition'
      : 'w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm placeholder:text-slate-400 focus:border-[#003087] focus:ring-2 focus:ring-[#003087]/20 outline-none transition'

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search icon */}
      <div
        className={`pointer-events-none absolute inset-y-0 left-0 flex items-center ${size === 'lg' ? 'pl-4' : 'pl-3'}`}
      >
        {loading ? (
          <svg
            className="h-5 w-5 animate-spin text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          <svg
            className="h-5 w-5 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        )}
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className={inputClass}
        aria-label="Αναζήτηση"
        autoComplete="off"
      />

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg scrollbar-hide">
          {results.map((r) => (
            <Link
              key={r.slug}
              href={`/ministers/${r.slug}`}
              onClick={() => {
                setOpen(false)
                setQuery('')
              }}
              className="flex flex-col px-4 py-3 hover:bg-slate-50 transition border-b border-slate-100 last:border-0"
            >
              <span className="text-sm font-medium text-slate-900">
                {r.name}
              </span>
              {r.currentRole && (
                <span className="text-xs text-slate-500 mt-0.5">
                  {r.currentRole}
                </span>
              )}
              {r.partyName && (
                <span className="text-xs text-[#003087] mt-0.5">
                  {r.partyName}
                </span>
              )}
            </Link>
          ))}
          <div
            className="px-4 py-2 text-xs text-slate-400 text-right cursor-pointer hover:bg-slate-50"
            onClick={() => {
              router.push(`/ministers?q=${encodeURIComponent(query)}`)
              setOpen(false)
            }}
          >
            Δείτε όλα τα αποτελέσματα →
          </div>
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
          <p className="text-sm text-slate-500">
            Δεν βρέθηκαν αποτελέσματα για &ldquo;{query}&rdquo;
          </p>
        </div>
      )}
    </div>
  )
}
