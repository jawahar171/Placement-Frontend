import { Outlet } from 'react-router-dom'
import Sidebar from '../common/Sidebar'
import {
  HomeIcon, BriefcaseIcon, DocumentTextIcon,
  CalendarIcon, UserIcon, BuildingOfficeIcon
} from '@heroicons/react/24/outline'

const studentLinks = [
  { to: '/student',              label: 'Dashboard',       icon: HomeIcon },
  { to: '/student/jobs',         label: 'Job Listings',    icon: BriefcaseIcon },
  { to: '/student/applications', label: 'My Applications', icon: DocumentTextIcon },
  { to: '/student/interviews',   label: 'Interviews',      icon: CalendarIcon, badge: 'notifications' },
  { to: '/student/drives',       label: 'Placement Drives',icon: BuildingOfficeIcon },
  { to: '/student/profile',      label: 'My Profile',      icon: UserIcon },
]

export default function StudentLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar links={studentLinks} role="student" />
      <main className="flex-1 overflow-auto">
        {/* pt-14 on mobile to clear the fixed top bar; no padding on lg+ */}
        <div className="pt-14 lg:pt-0">
          <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
