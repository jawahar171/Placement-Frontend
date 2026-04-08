import { useEffect, useState } from 'react'
import { RocketLaunchIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import api from '../../utils/axios'
import { StatusBadge, LoadingSpinner, EmptyState, Modal } from '../../components/common/UI'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

function CreateDriveModal({ open, onClose, onCreated }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [schedule, setSchedule] = useState([{ time: '', activity: '', venue: '' }])
  const [loading, setLoading]   = useState(false)

  const addRow = () => setSchedule(p => [...p, { time: '', activity: '', venue: '' }])
  const updateRow = (i, field, val) => setSchedule(p => p.map((r, j) => j === i ? { ...r, [field]: val } : r))
  const removeRow = (i) => setSchedule(p => p.filter((_, j) => j !== i))

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await api.post('/drives', {
        ...data,
        schedule: schedule.filter(s => s.activity),
        eligibility: {
          minCGPA: parseFloat(data.minCGPA) || 0,
          allowedDepartments: data.departments ? data.departments.split(',').map(s => s.trim()) : [],
          allowedBatches:     data.batches     ? data.batches.split(',').map(s => s.trim())     : [],
        },
        isVirtual: data.isVirtual === 'true',
      })
      toast.success('Drive created!')
      reset()
      setSchedule([{ time: '', activity: '', venue: '' }])
      onCreated()
      onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  const statuses = ['upcoming','registration_open','ongoing','completed','cancelled']

  return (
    <Modal open={open} onClose={onClose} title="Create Placement Drive" size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="label">Drive Title <span className="text-red-400">*</span></label>
          <input {...register('title', { required: true })} placeholder="Campus Placement Drive 2025" className="input" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea {...register('description')} rows={3} className="input resize-none" placeholder="About this drive..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Start Date <span className="text-red-400">*</span></label>
            <input {...register('startDate', { required: true })} type="date" className="input" />
          </div>
          <div>
            <label className="label">End Date <span className="text-red-400">*</span></label>
            <input {...register('endDate', { required: true })} type="date" className="input" />
          </div>
          <div>
            <label className="label">Registration Deadline</label>
            <input {...register('registrationDeadline')} type="date" className="input" />
          </div>
          <div>
            <label className="label">Status</label>
            <select {...register('status')} className="input">
              {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Venue</label>
            <input {...register('venue')} placeholder="Main Auditorium" className="input" />
          </div>
          <div>
            <label className="label">Virtual?</label>
            <select {...register('isVirtual')} className="input">
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Min CGPA</label>
            <input {...register('minCGPA')} type="number" step="0.1" placeholder="6.0" className="input" />
          </div>
          <div>
            <label className="label">Departments <span className="text-gray-400 font-normal text-xs">(comma sep)</span></label>
            <input {...register('departments')} placeholder="CSE,ECE,IT" className="input" />
          </div>
          <div>
            <label className="label">Batches <span className="text-gray-400 font-normal text-xs">(comma sep)</span></label>
            <input {...register('batches')} placeholder="2021-2025" className="input" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Schedule</label>
            <button type="button" onClick={addRow} className="text-xs text-gold-600 hover:text-gold-700 font-medium">+ Add Row</button>
          </div>
          <div className="space-y-2">
            {schedule.map((row, i) => (
              <div key={i} className="flex gap-2">
                <input value={row.time} onChange={e => updateRow(i, 'time', e.target.value)} placeholder="9:00 AM" className="input w-28 flex-shrink-0" />
                <input value={row.activity} onChange={e => updateRow(i, 'activity', e.target.value)} placeholder="Registration & Document Verification" className="input flex-1" />
                <input value={row.venue} onChange={e => updateRow(i, 'venue', e.target.value)} placeholder="Hall A" className="input w-28 flex-shrink-0" />
                {schedule.length > 1 && <button type="button" onClick={() => removeRow(i)} className="text-red-400 hover:text-red-600 px-2">×</button>}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Creating...' : 'Create Drive'}</button>
        </div>
      </form>
    </Modal>
  )
}

export default function AdminDrives() {
  const [drives, setDrives]   = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editDrive, setEditDrive]   = useState(null)

  const fetchDrives = () => {
    api.get('/drives').then(r => { setDrives(r.data.drives); setLoading(false) })
  }

  useEffect(() => { fetchDrives() }, [])

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/drives/${id}`, { status })
      toast.success('Status updated')
      fetchDrives()
    } catch { toast.error('Failed') }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Placement Drives</h1>
          <p className="text-gray-500 text-sm mt-1">{drives.length} drives</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Create Drive
        </button>
      </div>

      {drives.length === 0 ? (
        <EmptyState icon={RocketLaunchIcon} title="No drives yet" description="Create your first placement drive to get started"
          action={<button onClick={() => setCreateOpen(true)} className="btn-primary">Create Drive</button>} />
      ) : (
        <div className="space-y-4">
          {drives.map(drive => (
            <div key={drive._id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-gray-900 text-lg">{drive.title}</h3>
                    <StatusBadge status={drive.status} />
                    {drive.isVirtual && <span className="badge badge-blue">Virtual</span>}
                  </div>
                  {drive.description && <p className="text-sm text-gray-500 mt-1">{drive.description}</p>}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    <span>📅 {dayjs(drive.startDate).format('DD MMM')} – {dayjs(drive.endDate).format('DD MMM YYYY')}</span>
                    {drive.venue && <span>📍 {drive.venue}</span>}
                    <span>👥 {drive.stats?.totalRegistered || 0} registered</span>
                    <span>🏢 {drive.companies?.length || 0} companies</span>
                    <span>🎯 {drive.stats?.totalOffers || 0} offers</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <select value={drive.status} onChange={e => updateStatus(drive._id, e.target.value)}
                    className="input text-sm py-1.5 w-44">
                    {['upcoming','registration_open','ongoing','completed','cancelled'].map(s =>
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    )}
                  </select>
                </div>
              </div>

              {drive.schedule?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Schedule</p>
                  <div className="grid sm:grid-cols-2 gap-1">
                    {drive.schedule.map((s, i) => (
                      <div key={i} className="flex gap-3 text-sm text-gray-500">
                        <span className="text-gray-300 w-16 flex-shrink-0 font-mono text-xs">{s.time}</span>
                        <span className="flex-1">{s.activity}</span>
                        {s.venue && <span className="text-gray-300 text-xs">{s.venue}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <CreateDriveModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={fetchDrives} />
    </div>
  )
}
