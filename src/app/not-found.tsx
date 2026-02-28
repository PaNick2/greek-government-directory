import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-7xl font-bold text-slate-200 select-none mb-2">404</p>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Η σελίδα δεν βρέθηκε</h1>
      <p className="text-slate-500 text-sm mb-8 max-w-sm">
        Η σελίδα που αναζητάτε δεν υπάρχει ή έχει μετακινηθεί.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="rounded-lg bg-[#003087] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#002070] transition"
        >
          Αρχική σελίδα
        </Link>
        <Link
          href="/ministers"
          className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:border-[#003087] transition"
        >
          Υπουργοί
        </Link>
        <Link
          href="/governments"
          className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:border-[#003087] transition"
        >
          Κυβερνήσεις
        </Link>
      </div>
    </div>
  )
}
