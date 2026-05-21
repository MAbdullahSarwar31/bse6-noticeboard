export const CATEGORIES = [
  { key: 'Academic',       label: 'Academic',       icon: '🎓' },
  { key: 'Event',          label: 'Event',           icon: '📅' },
  { key: 'Urgent',         label: 'Urgent',          icon: '🚨' },
  { key: 'General',        label: 'General',         icon: '💬' },
  { key: 'Sports',         label: 'Sports',          icon: '⚽' },
  { key: 'Administration', label: 'Administration',  icon: '🏛' },
]

export default function CategoryFilter({ active, onChange, counts }) {
  return (
    <div className="category-scroll" role="navigation" aria-label="Filter by category">
      <div className="category-pills">
        {/* "All" pill */}
        <button
          id="filter-all"
          className={`pill ${active === 'All' ? 'active' : ''}`}
          onClick={() => onChange('All')}
          aria-pressed={active === 'All'}
        >
          🗂 All
          <span className="pill-count">
            {Object.values(counts).reduce((s, v) => s + v, 0)}
          </span>
        </button>

        {CATEGORIES.map(({ key, label, icon }) => (
          <button
            key={key}
            id={`filter-${key.toLowerCase()}`}
            className={`pill ${active === key ? 'active' : ''}`}
            onClick={() => onChange(key)}
            aria-pressed={active === key}
          >
            {icon} {label}
            <span className="pill-count">{counts[key] ?? 0}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
