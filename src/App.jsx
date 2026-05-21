import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient'
import Header from './components/Header'
import Auth from './components/Auth'
import NoticeBoard from './components/NoticeBoard'

/* ============================================================
   TOAST SYSTEM
   ============================================================ */
let toastId = 0

function ToastContainer({ toasts }) {
  if (!toasts.length) return null
  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  )
}

/* ============================================================
   APP ROOT
   ============================================================ */
export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [toasts,  setToasts]  = useState([])

  /* ── Supabase session listener ── */
  useEffect(() => {
    // Get existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth changes (sign-in / sign-out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )

    return () => subscription.unsubscribe()
  }, [])

  /* ── Toast helper ── */
  const showToast = useCallback((message, type = 'success') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  /* ── Loading state while session resolves ── */
  if (session === undefined) {
    return (
      <div className="auth-wrapper">
        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
          <p>Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-wrapper">
      <Header session={session} />

      <div className="main-content">
        {!session ? (
          <Auth />
        ) : (
          <NoticeBoard session={session} showToast={showToast} />
        )}
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  )
}
