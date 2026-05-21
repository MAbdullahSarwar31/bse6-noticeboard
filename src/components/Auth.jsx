import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [mode, setMode]       = useState('signin') // 'signin' | 'signup'
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (mode === 'signup') {
        const { error: err } = await supabase.auth.signUp({ email, password })
        if (err) throw err
        setError('✓ Account created! Check your email to confirm, then sign in.')
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) throw err
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (m) => {
    setMode(m)
    setError(null)
    setEmail('')
    setPass('')
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Branding */}
        <div className="auth-logo">
          <div className="logo-badge">🔔</div>
          <h1>Campus Notice Board</h1>
          <p>Bahria University — Lab 10A</p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={mode === 'signin'}
            className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => switchMode('signin')}
          >
            Sign In
          </button>
          <button
            role="tab"
            aria-selected={mode === 'signup'}
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => switchMode('signup')}
          >
            Create Account
          </button>
        </div>

        {/* Error / Info */}
        {error && (
          <div className="auth-error" role="alert">{error}</div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Floating label — Email */}
          <div className="field">
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email"
              required
              autoComplete="email"
            />
            <label htmlFor="auth-email">University Email</label>
          </div>

          {/* Floating label — Password */}
          <div className="field">
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={e => setPass(e.target.value)}
              placeholder="password"
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
            <label htmlFor="auth-password">Password (min. 6 chars)</label>
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading || !email || !password}
          >
            {loading
              ? '⏳ Please wait…'
              : mode === 'signin' ? '→ Sign In' : '✦ Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
