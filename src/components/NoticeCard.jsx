import { useState } from 'react'

/* ── Utility: relative time ── */
export function formatRelativeTime(dateStr) {
  const now   = Date.now()
  const then  = new Date(dateStr).getTime()
  const diff  = Math.floor((now - then) / 1000) // seconds

  if (diff < 60)        return 'just now'
  if (diff < 3600)      return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400)     return `${Math.floor(diff / 3600)} hr ago`
  if (diff < 604800)    return `${Math.floor(diff / 86400)} days ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

/* ── Utility: is notice "NEW" (< 10 minutes old) ── */
function isNew(dateStr) {
  return (Date.now() - new Date(dateStr).getTime()) < 10 * 60 * 1000
}

/* ── Category icon map ── */
const CAT_ICON = {
  Academic:       '🎓',
  Event:          '📅',
  Urgent:         '🚨',
  General:        '💬',
  Sports:         '⚽',
  Administration: '🏛',
}

export default function NoticeCard({ notice, session, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting]           = useState(false)

  const isOwner   = session?.user?.id === notice.user_id
  const profile   = notice.profiles
  const poster    = isOwner
    ? 'You'
    : profile?.display_name || profile?.email?.split('@')[0] || 'Anonymous'

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(notice.id)
    setDeleting(false)
    setConfirmDelete(false)
  }

  return (
    <article
      className="notice-card"
      data-cat={notice.category}
      aria-label={`Notice: ${notice.title}`}
    >
      <div className="card-inner">
        {/* Top row: title + category chip */}
        <div className="card-top">
          <h2 className="card-title">
            {notice.title}
            {isNew(notice.created_at) && (
              <span className="new-badge" aria-label="New notice">NEW</span>
            )}
          </h2>
          <span className="cat-chip" data-cat={notice.category}>
            {CAT_ICON[notice.category]} {notice.category}
          </span>
        </div>

        {/* Body — clamped to 3 lines */}
        <p className="card-body">{notice.body}</p>

        {/* Footer */}
        <div className="card-footer">
          <div className="card-meta">
            <span className="card-poster">Posted by {poster}</span>
            <span className="card-time">{formatRelativeTime(notice.created_at)}</span>
          </div>

          {/* Delete controls — owner only */}
          {isOwner && (
            <div className="card-actions">
              {confirmDelete ? (
                <div className="delete-confirm">
                  <span>Sure?</span>
                  <button
                    id={`confirm-yes-${notice.id}`}
                    className="btn btn-danger btn-sm"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? '…' : 'Yes'}
                  </button>
                  <button
                    id={`confirm-no-${notice.id}`}
                    className="btn btn-ghost btn-sm"
                    onClick={() => setConfirmDelete(false)}
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  id={`delete-${notice.id}`}
                  className="btn btn-danger btn-sm"
                  onClick={() => setConfirmDelete(true)}
                  title="Delete this notice"
                  aria-label="Delete notice"
                >
                  🗑
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
