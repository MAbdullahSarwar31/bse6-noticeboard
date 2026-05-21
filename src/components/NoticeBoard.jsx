import { useState, useMemo } from 'react'
import CategoryFilter from './CategoryFilter'
import NoticeCard from './NoticeCard'
import NoticeForm from './NoticeForm'
import { useNotices } from '../hooks/useNotices'

/* ── Skeleton placeholder cards ── */
function SkeletonCards() {
  return Array.from({ length: 6 }).map((_, i) => (
    <div key={i} className="skeleton-card">
      <div className="skeleton sk-title" />
      <div className="skeleton sk-body1" />
      <div className="skeleton sk-body2" />
      <div className="skeleton sk-body3" />
      <div className="skeleton sk-footer" />
    </div>
  ))
}

export default function NoticeBoard({ session, showToast }) {
  const { notices, loading, error, postNotice, deleteNotice } = useNotices(session)

  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery,    setSearchQuery]    = useState('')
  const [formOpen,       setFormOpen]       = useState(false)

  /* ── Per-category counts (across all notices, ignoring filter) ── */
  const counts = useMemo(() => {
    return notices.reduce((acc, n) => {
      acc[n.category] = (acc[n.category] ?? 0) + 1
      return acc
    }, {})
  }, [notices])

  /* ── Filtered + searched notices ── */
  const filtered = useMemo(() => {
    return notices.filter(n => {
      const matchCat    = activeCategory === 'All' || n.category === activeCategory
      const q           = searchQuery.toLowerCase()
      const matchSearch = !q ||
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
  }, [notices, activeCategory, searchQuery])

  /* ── Delete handler with toast ── */
  const handleDelete = async (id) => {
    const result = await deleteNotice(id)
    if (result.success) {
      showToast('Notice deleted ✓', 'error')
    } else {
      showToast(result.message || 'Delete failed.', 'error')
    }
  }

  /* ── FAB click: guard if not signed in ── */
  const handleFabClick = () => {
    if (!session) {
      showToast('Please sign in to post', 'warn')
      return
    }
    setFormOpen(v => !v)
  }

  return (
    <>
      {/* Controls: search + filter */}
      <div className="controls-bar">
        {/* Search */}
        <div className="search-wrap">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            id="search-input"
            className="search-input"
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search notices…"
            aria-label="Search notices"
          />
        </div>

        {/* Category pills */}
        <CategoryFilter
          active={activeCategory}
          onChange={setActiveCategory}
          counts={counts}
        />
      </div>

      {/* Error banner */}
      {error && (
        <div className="auth-error" role="alert" style={{ marginBottom: 20 }}>
          ⚠ {error}
        </div>
      )}

      {/* Notice grid */}
      <main className="notice-grid" id="notice-grid" aria-live="polite">
        {loading ? (
          <SkeletonCards />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No notices here yet</h3>
            <p>
              {searchQuery
                ? `No results for "${searchQuery}". Try a different search.`
                : 'No notices in this category yet. Be the first to post!'}
            </p>
          </div>
        ) : (
          filtered.map(notice => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              session={session}
              onDelete={handleDelete}
            />
          ))
        )}
      </main>

      {/* FAB */}
      <button
        id="fab-post"
        className={`fab ${formOpen ? 'open' : ''}`}
        onClick={handleFabClick}
        aria-label={formOpen ? 'Close post form' : 'Post a new notice'}
        title={session ? 'Post a notice' : 'Sign in to post'}
      >
        +
      </button>

      {/* Post form modal */}
      {formOpen && session && (
        <NoticeForm
          onPost={postNotice}
          onClose={() => setFormOpen(false)}
          showToast={showToast}
        />
      )}
    </>
  )
}
