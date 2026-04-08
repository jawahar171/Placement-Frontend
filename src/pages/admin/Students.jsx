import { useEffect, useState } from 'react'
import { AcademicCapIcon, FunnelIcon } from '@heroicons/react/24/outline'
import api from '../../utils/axios'
import { StatusBadge, LoadingSpinner, EmptyState, Modal, Avatar } from '../../components/common/UI'
import toast from 'react-hot-toast'

const DEPTS = ['CSE','ECE','EEE','MECH','CIVIL','IT','AIDS','AIML','CSD']

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [dept, setDept]         = useState('')
  const [statusFilter, setStatus] = useState('')
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)
  const [selected, setSelected] = useState([])
  const [detailStudent, setDetailStudent] = useState(null)
  const [placementEdit, setPlacementEdit] = useState(null)

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 25 })
      if (search)       params.append('search', search)
      if (dept)         params.append('department', dept)
      if (statusFilter) params.append('status', statusFilter)
      const { data } = await api.get(`/students?${params}`)
      setStudents(data.students)
      setTotal(data.total)
    } catch { toast.error('Failed to load students') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchStudents() }, [search, dept, statusFilter, page])

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/toggle-status`)
      toast.success('Status updated')
      fetchStudents()
    } catch { toast.error('Failed') }
  }

  const handlePlacementUpdate = async (e) => {
    e.preventDefault()
    try {
      await api.patch(`/admin/students/${placementEdit.id}/placement`, placementEdit.data)
      toast.success('Placement status updated')
      setPlacementEdit(null)
      fetchStudents()
    } catch { toast.error('Failed') }
  }

  const handleBulkStatus = async (placementStatus) => {
    if (!selected.length) { toast.error('Select students first'); return }
    if (!confirm(`Update ${selected.length} students to "${placementStatus}"?`)) return
    try {
      await api.post('/admin/students/bulk-status', { studentIds: selected, placementStatus })
      toast.success(`Updated ${selected.length} students`)
      setSelected([])
      fetchStudents()
    } catch { toast.error('Failed') }
  }

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const selectAll    = () => setSelected(students.map(s => s._id))
  const clearSelect  = () => setSelected([])

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total students</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search name, email, roll..." className="input w-52" />
          <select value={dept} onChange={e => { setDept(e.target.value); setPage(1) }} className="input w-32">
            <option value="">All depts</option>
            {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1) }} className="input w-36">
            <option value="">All statuses</option>
            <option value="not_placed">Not Placed</option>
            <option value="placed">Placed</option>
            <option value="opted_out">Opted Out</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-gold-50 border border-gold-200 rounded-xl">
          <span className="text-sm font-medium text-gold-800">{selected.length} selected</span>
          <button onClick={() => handleBulkStatus('placed')}     className="btn-primary text-xs py-1.5 px-3">Mark Placed</button>
          <button onClick={() => handleBulkStatus('not_placed')} className="btn-secondary text-xs py-1.5 px-3">Mark Not Placed</button>
          <button onClick={() => handleBulkStatus('opted_out')}  className="btn-secondary text-xs py-1.5 px-3">Mark Opted Out</button>
          <button onClick={clearSelect} className="ml-auto text-xs text-gray-500 hover:text-gray-700">Clear</button>
        </div>
      )}

      {loading ? <LoadingSpinner /> : students.length === 0 ? (
        <EmptyState icon={AcademicCapIcon} title="No students found" description="Try different filters" />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-th w-8">
                    <input type="checkbox" checked={selected.length === students.length} onChange={selected.length === students.length ? clearSelect : selectAll}
                      className="rounded border-gray-300 text-gold-500 focus:ring-gold-400" />
                  </th>
                  <th className="table-th">Student</th>
                  <th className="table-th">Roll / Dept</th>
                  <th className="table-th">CGPA</th>
                  <th className="table-th">Skills</th>
                  <th className="table-th">Placement</th>
                  <th className="table-th">Offered Company</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map(s => {
                  const sp = s.studentProfile
                  return (
                    <tr key={s._id} className="table-row">
                      <td className="table-td">
                        <input type="checkbox" checked={selected.includes(s._id)} onChange={() => toggleSelect(s._id)}
                          className="rounded border-gray-300 text-gold-500 focus:ring-gold-400" />
                      </td>
                      <td className="table-td">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={s.name} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{s.name}</p>
                            <p className="text-xs text-gray-400">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-td">
                        <p className="text-sm font-mono text-gray-600">{sp?.rollNumber || '—'}</p>
                        <p className="text-xs text-gray-400">{sp?.department} · {sp?.batch}</p>
                      </td>
                      <td className="table-td">
                        <span className={`font-mono text-sm font-semibold ${sp?.cgpa >= 8 ? 'text-green-600' : sp?.cgpa >= 6 ? 'text-amber-600' : 'text-gray-500'}`}>
                          {sp?.cgpa || '—'}
                        </span>
                      </td>
                      <td className="table-td">
                        <div className="flex flex-wrap gap-1 max-w-[140px]">
                          {sp?.skills?.slice(0, 2).map(sk => <span key={sk} className="px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-600">{sk}</span>)}
                          {sp?.skills?.length > 2 && <span className="text-xs text-gray-400">+{sp.skills.length - 2}</span>}
                        </div>
                      </td>
                      <td className="table-td"><StatusBadge status={sp?.placementStatus || 'not_placed'} /></td>
                      <td className="table-td">
                        {sp?.offeredCompany ? (
                          <div>
                            <p className="text-sm text-gray-700 font-medium">{sp.offeredCompany}</p>
                            {sp?.offeredPackage && <p className="text-xs text-green-600">₹{sp.offeredPackage} LPA</p>}
                          </div>
                        ) : '—'}
                      </td>
                      <td className="table-td">
                        <div className="flex gap-1">
                          <button onClick={() => setDetailStudent(s)} className="btn-ghost text-xs py-1 px-2">View</button>
                          <button onClick={() => setPlacementEdit({ id: s._id, name: s.name, data: { placementStatus: sp?.placementStatus, offeredCompany: sp?.offeredCompany, offeredRole: sp?.offeredRole, offeredPackage: sp?.offeredPackage } })}
                            className="btn-ghost text-xs py-1 px-2 text-blue-500">Edit</button>
                          <button onClick={() => handleToggleStatus(s._id)}
                            className={`text-xs py-1 px-2 rounded-lg font-medium ${s.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
                            {s.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-400">Showing {Math.min((page - 1) * 25 + 1, total)}–{Math.min(page * 25, total)} of {total}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm py-1.5 px-3">← Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 25)} className="btn-secondary text-sm py-1.5 px-3">Next →</button>
            </div>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      <Modal open={!!detailStudent} onClose={() => setDetailStudent(null)} title="Student Details" size="lg">
        {detailStudent && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <Avatar name={detailStudent.name} size="lg" />
              <div>
                <h3 className="font-semibold text-gray-900">{detailStudent.name}</h3>
                <p className="text-sm text-gray-500">{detailStudent.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Roll Number', detailStudent.studentProfile?.rollNumber],
                ['Department',  detailStudent.studentProfile?.department],
                ['Batch',       detailStudent.studentProfile?.batch],
                ['CGPA',        detailStudent.studentProfile?.cgpa],
                ['10th %',      detailStudent.studentProfile?.tenthPercentage],
                ['12th %',      detailStudent.studentProfile?.twelfthPercentage],
                ['Phone',       detailStudent.studentProfile?.phone],
                ['Status',      detailStudent.studentProfile?.placementStatus],
              ].map(([k, v]) => (
                <div key={k} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400">{k}</p>
                  <p className="font-medium text-gray-700 mt-0.5">{v || '—'}</p>
                </div>
              ))}
            </div>
            {detailStudent.studentProfile?.skills?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {detailStudent.studentProfile.skills.map(s => <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{s}</span>)}
                </div>
              </div>
            )}
            {detailStudent.studentProfile?.resumeUrl && (
              <a href={detailStudent.studentProfile.resumeUrl} target="_blank" rel="noreferrer" className="btn-secondary block text-center text-sm">View Resume</a>
            )}
          </div>
        )}
      </Modal>

      {/* Placement Edit Modal */}
      <Modal open={!!placementEdit} onClose={() => setPlacementEdit(null)} title={`Edit Placement — ${placementEdit?.name}`}>
        {placementEdit && (
          <form onSubmit={handlePlacementUpdate} className="space-y-4">
            <div>
              <label className="label">Placement Status</label>
              <select value={placementEdit.data.placementStatus} onChange={e => setPlacementEdit(p => ({ ...p, data: { ...p.data, placementStatus: e.target.value } }))} className="input">
                <option value="not_placed">Not Placed</option>
                <option value="placed">Placed</option>
                <option value="opted_out">Opted Out</option>
              </select>
            </div>
            {placementEdit.data.placementStatus === 'placed' && (
              <>
                <div>
                  <label className="label">Offered Company</label>
                  <input value={placementEdit.data.offeredCompany || ''} onChange={e => setPlacementEdit(p => ({ ...p, data: { ...p.data, offeredCompany: e.target.value } }))} className="input" />
                </div>
                <div>
                  <label className="label">Offered Role</label>
                  <input value={placementEdit.data.offeredRole || ''} onChange={e => setPlacementEdit(p => ({ ...p, data: { ...p.data, offeredRole: e.target.value } }))} className="input" />
                </div>
                <div>
                  <label className="label">Package (LPA)</label>
                  <input type="number" step="0.5" value={placementEdit.data.offeredPackage || ''} onChange={e => setPlacementEdit(p => ({ ...p, data: { ...p.data, offeredPackage: e.target.value } }))} className="input" />
                </div>
              </>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setPlacementEdit(null)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">Save</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
