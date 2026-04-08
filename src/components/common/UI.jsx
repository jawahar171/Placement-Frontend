// StatusBadge
export function StatusBadge({ status }) {
  const map = {
    submitted:            'badge-blue',
    reviewed:             'badge-blue',
    shortlisted:          'badge-green',
    aptitude_scheduled:   'badge-amber',
    aptitude_cleared:     'badge-green',
    interview_scheduled:  'badge-amber',
    interview_completed:  'badge-purple',
    offered:              'badge-green',
    offer_accepted:       'badge-green',
    offer_rejected:       'badge-red',
    rejected:             'badge-red',
    withdrawn:            'badge-gray',
    active:               'badge-green',
    closed:               'badge-red',
    draft:                'badge-gray',
    scheduled:            'badge-blue',
    completed:            'badge-green',
    cancelled:            'badge-red',
    rescheduled:          'badge-amber',
    no_show:              'badge-red',
    placed:               'badge-green',
    not_placed:           'badge-gray',
    opted_out:            'badge-amber',
    upcoming:             'badge-blue',
    registration_open:    'badge-green',
    ongoing:              'badge-amber',
  }
  const cls = map[status] || 'badge-gray'
  const label = status?.replace(/_/g, ' ') || 'unknown'
  return <span className={cls}>{label}</span>
}

// StatCard
export function StatCard({ label, value, icon: Icon, color = 'gold', trend }) {
  const colors = {
    gold:   'bg-gold-50   text-gold-600',
    blue:   'bg-blue-50   text-blue-600',
    green:  'bg-green-50  text-green-600',
    red:    'bg-red-50    text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <div className="stat-card">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-ink-900 mt-0.5">{value ?? '—'}</p>
        {trend && <p className="text-xs text-gray-400 mt-1">{trend}</p>}
      </div>
    </div>
  )
}

// Modal
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${widths[size]} max-h-[90vh] overflow-y-auto animate-in`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="section-title">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// EmptyState
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-gray-400" />
      </div>
      <h3 className="font-semibold text-gray-700 text-base">{title}</h3>
      {description && <p className="text-sm text-gray-400 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// LoadingSpinner
export function LoadingSpinner({ className = 'h-64' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-8 h-8 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// PageHeader
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// Table
export function Table({ headers, children, empty }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {headers.map(h => <th key={h} className="table-th">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {children}
          </tbody>
        </table>
        {empty}
      </div>
    </div>
  )
}

// Avatar
export function Avatar({ name, size = 'md', src }) {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }
  if (src) return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover`} />
  return (
    <div className={`${sizes[size]} bg-ink-100 rounded-full flex items-center justify-center font-semibold text-ink-700 flex-shrink-0`}>
      {initials}
    </div>
  )
}
