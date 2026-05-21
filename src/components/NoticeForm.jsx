import { useState } from 'react'
import { CATEGORIES } from './CategoryFilter'

const TITLE_MAX = 80
const BODY_MAX  = 500

export default function NoticeForm({ onPost, onClose, showToast }) {
  const [title,    setTitle]    = useState('')
  const [body,     setBody]     = useState('')
  const [category, setCategory] = useState('General')
  const [loading,  setLoading]  = useState(false)

  const titleLeft = TITLE_MAX - title.length
  const bodyLeft  = BODY_MAX  - body.length

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    setLoading(true)
    const result = await onPost({ title: title.trim(), body: body.trim(), category })
    setLoading(false)
    if (result.success) {
      showToast('Notice posted successfully ✓', 'success')
      onClose()
    } else {
      showToast(result.message || 'Failed to post notice.', 'error')
    }
  }

  return (
    <div
      className="form-panel-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Post a new notice"
    >
      <div className="form-panel">
        <h2>📝 Post a Notice</h2>

        <form onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="notice-title">
              Title
              <span className={`char-count ${titleLeft < 15 ? (titleLeft < 0 ? 'over' : 'warn') : ''}`}>
                {titleLeft} left
              </span>
            </label>
            <input
              id="notice-title"
              className="form-control"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value.slice(0, TITLE_MAX))}
              placeholder="Brief, descriptive title…"
              required
              maxLength={TITLE_MAX}
            />
          </div>

          {/* Body */}
          <div className="form-group">
            <label className="form-label" htmlFor="notice-body">
              Body
              <span className={`char-count ${bodyLeft < 50 ? (bodyLeft < 0 ? 'over' : 'warn') : ''}`}>
                {bodyLeft} left
              </span>
            </label>
            <textarea
              id="notice-body"
              className="form-control"
              rows={5}
              value={body}
              onChange={e => setBody(e.target.value.slice(0, BODY_MAX))}
              placeholder="Describe your notice in detail…"
              required
              maxLength={BODY_MAX}
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label" htmlFor="notice-category">
              Category
            </label>
            <select
              id="notice-category"
              className="form-control"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {CATEGORIES.map(({ key, label, icon }) => (
                <option key={key} value={key}>{icon} {label}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              id="post-submit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={loading || !title.trim() || !body.trim() || titleLeft < 0 || bodyLeft < 0}
            >
              {loading ? '⏳ Posting…' : '✦ Post Notice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
