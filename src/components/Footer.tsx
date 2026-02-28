import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-[#003087] text-white text-sm font-bold">
                ΕΚ
              </div>
              <span className="text-sm font-semibold text-slate-800">
                Ελληνικό Κυβερνητικό Αρχείο
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ανεξάρτητη βάση δεδομένων για τη διαφάνεια και ευθύνη των
              Ελλήνων πολιτικών.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Περιήγηση
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/ministers" className="hover:text-[#003087]">
                  Υπουργοί
                </Link>
              </li>
              <li>
                <Link href="/governments" className="hover:text-[#003087]">
                  Κυβερνήσεις
                </Link>
              </li>
              <li>
                <Link href="/parties" className="hover:text-[#003087]">
                  Κόμματα
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Πληροφορίες
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <span className="text-slate-400">
                  Πηγές: Βουλή των Ελλήνων, ΦΕΚ, δημόσια αρχεία
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          Ελληνικό Κυβερνητικό Αρχείο — Ανεξάρτητο, μη κομματικό πρότζεκτ.
        </div>
      </div>
    </footer>
  )
}
