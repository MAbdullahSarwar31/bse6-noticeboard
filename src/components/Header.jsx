import { supabase } from '../supabaseClient'

export default function Header({ session }) {
  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const emailPrefix = session?.user?.email?.split('@')[0] ?? ''

  return (
    <header className="header" role="banner">
      {/* Brand */}
      <div className="header-brand">
        <div className="brand-icon" aria-hidden="true">🔔</div>
        <div>
          <div className="brand-name">Campus Notice Board</div>
          <div className="brand-sub">Bahria University — Lab 10A</div>
        </div>
      </div>

      {/* Right side */}
      {session && (
        <div className="header-right">
          <span className="header-user-email" title={session.user.email}>
            👤 {emailPrefix}
          </span>
          <button
            id="signout-btn"
            className="btn btn-ghost btn-sm"
            onClick={handleSignOut}
            title="Sign out"
          >
            Sign Out
          </button>
        </div>
      )}
    </header>
  )
}
