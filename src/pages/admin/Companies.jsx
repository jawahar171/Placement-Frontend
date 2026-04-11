import { useEffect, useState } from 'react'
import { BuildingOffice2Icon } from '@heroicons/react/24/outline'
import api from '../../utils/axios'
import { LoadingSpinner, EmptyState, Modal, Avatar } from '../../components/common/UI'
import toast from 'react-hot-toast'

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [detail, setDetail]       = useState(null)

  const fetchCompanies = () => {
    const params = new URLSearchParams()
    if (search)       params.append('search', search)
    if (activeFilter) params.append('status', activeFilter)
    api.get(`/companies?${params}`).then(r => { setCompanies(r.data.companies); setLoading(false) })
  }

  useEffect(() => { fetchCompanies() }, [search, activeFilter])

  const toggleStatus = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/toggle-status`)
      toast.success('Status updated')
      fetchCompanies()
    } catch { toast.error('Failed') }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Companies</h1>
          <p className="text-gray-500 text-sm mt-1">{companies.length} partner companies</p>
        </div>
        <div className="flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..." className="input w-52" />
          <select value={activeFilter} onChange={e => setActiveFilter(e.target.value)} className="input w-36">
            <option value="">All accounts</option>
            <option value="active">Active</option>
            <option value="inactive">Deactivated</option>
          </select>
        </div>
      </div>

      {companies.length === 0 ? (
        <EmptyState icon={BuildingOffice2Icon} title="No companies" description="Companies appear here after they register" />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map(c => {
            // fields are flat on c
            return (
              <div key={c._id} className="card hover:shadow-card-hover transition-all">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {c.logoUrl
                      ? <img src={c.logoUrl} alt="" className="w-full h-full object-cover" />
                      : <BuildingOffice2Icon className="w-6 h-6 text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{c.companyName || c.name}</h3>
                    <p className="text-sm text-gray-400">{c.industry || 'Industry not set'}</p>
                  </div>
                  <span className={`badge flex-shrink-0 ${c.isActive ? 'badge-green' : 'badge-red'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="space-y-1 text-sm text-gray-500 mb-4">
                  <p>✉ {c.email}</p>
                  {c.hrName   && <p>👤 {c.hrName}</p>}
                  {c.hrPhone  && <p>📞 {c.hrPhone}</p>}
                  {c.website  && <a href={c.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline block truncate">🌐 {c.website}</a>}
                  {c.employeeCount && <p>👥 {c.employeeCount} employees</p>}
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-50">
                  <button onClick={() => setDetail(c)} className="btn-ghost text-sm py-1.5 flex-1">View Details</button>
                  <button onClick={() => toggleStatus(c._id)} className={`text-sm py-1.5 px-3 rounded-xl font-medium transition-colors ${c.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
                    {c.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Company Details" size="lg">
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Company', detail?.companyName],
                ['Industry', detail?.industry],
                ['Email', detail.email],
                ['Website', detail?.website],
                ['HR Name', detail?.hrName],
                ['HR Phone', detail?.hrPhone],
                ['Employees', detail?.employeeCount],
                ['Founded', detail?.foundedYear],
              ].map(([k, v]) => (
                <div key={k} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400">{k}</p>
                  <p className="font-medium text-gray-700 mt-0.5">{v || '—'}</p>
                </div>
              ))}
            </div>
            {detail?.description && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">About</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">{detail.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
