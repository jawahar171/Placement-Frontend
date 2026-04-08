import { useEffect, useState } from 'react'
import { RocketLaunchIcon, CalendarIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline'
import api from '../../utils/axios'
import { StatusBadge, LoadingSpinner, EmptyState } from '../../components/common/UI'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

export default function StudentDrives() {
  const { user } = useAuth()
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDrives = () => {
    api.get('/drives').then(r => {
      setDrives(r.data.drives)
      setLoading(false)
    })
  }

  useEffect(() => { fetchDrives() }, [])

  const isRegistered = (drive) => drive.registeredStudents?.some(s => s === user?._id || s?._id === user?._id)

  const handleRegister = async (driveId) => {
    try {
      await api.post(`/drives/${driveId}/register`)
      toast.success('Registered successfully!')
      fetchDrives()
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed') }
  }

  const handleUnregister = async (driveId) => {
    if (!confirm('Unregister from this drive?')) return
    try {
      await api.delete(`/drives/${driveId}/unregister`)
      toast.success('Unregistered')
      fetchDrives()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <h1 className="page-title mb-6">Placement Drives</h1>

      {drives.length === 0 ? (
        <EmptyState icon={RocketLaunchIcon} title="No drives scheduled" description="Placement drives will be announced here" />
      ) : (
        <div className="space-y-4">
          {drives.map(drive => {
            const registered = isRegistered(drive)
            const isOpen     = drive.status === 'registration_open'
            return (
              <div key={drive._id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <RocketLaunchIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{drive.title}</h3>
                      {drive.description && <p className="text-sm text-gray-500 mt-1">{drive.description}</p>}
                      <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <CalendarIcon className="w-4 h-4" />
                          {dayjs(drive.startDate).format('DD MMM')} – {dayjs(drive.endDate).format('DD MMM YYYY')}
                        </span>
                        {drive.venue && <span>📍 {drive.venue}</span>}
                        {drive.isVirtual && <span className="badge badge-blue">Virtual</span>}
                      </div>
                      {drive.companies?.length > 0 && (
                        <div className="flex items-center gap-2 mt-3">
                          <BuildingOffice2Icon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{drive.companies.length} companies participating</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <StatusBadge status={drive.status} />
                    <p className="text-sm text-gray-400">{drive.stats?.totalRegistered || 0} registered</p>
                    {isOpen && (
                      registered
                        ? <button onClick={() => handleUnregister(drive._id)} className="btn-secondary text-sm py-1.5">Unregister</button>
                        : <button onClick={() => handleRegister(drive._id)} className="btn-primary text-sm py-1.5">Register</button>
                    )}
                    {registered && !isOpen && (
                      <span className="badge badge-green">Registered ✓</span>
                    )}
                  </div>
                </div>

                {drive.schedule?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-50">
                    <p className="text-sm font-medium text-gray-700 mb-2">Schedule</p>
                    <div className="space-y-1">
                      {drive.schedule.map((s, i) => (
                        <div key={i} className="flex gap-3 text-sm text-gray-500">
                          <span className="text-gray-300 w-16 flex-shrink-0">{s.time}</span>
                          <span>{s.activity}</span>
                          {s.venue && <span className="text-gray-300">· {s.venue}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
