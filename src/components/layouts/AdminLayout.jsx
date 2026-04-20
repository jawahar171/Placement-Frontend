import { Outlet } from 'react-router-dom'
import Sidebar from '../common/Sidebar'
import QueryChatBox from '../common/QueryChatBox'
import {
  HomeIcon, AcademicCapIcon, BuildingOffice2Icon,
  CalendarDaysIcon, ChartBarIcon, RocketLaunchIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

const adminLinks = [
  { to: '/admin',            label: 'Dashboard',        icon: HomeIcon },
  { to: '/admin/students',   label: 'Students',         icon: AcademicCapIcon },
  { to: '/admin/companies',  label: 'Companies',        icon: BuildingOffice2Icon },
  { to: '/admin/drives',     label: 'Placement Drives', icon: RocketLaunchIcon },
  { to: '/admin/interviews', label: 'Interviews',       icon: CalendarDaysIcon },
  { to: '/admin/reports',    label: 'Reports',          icon: ChartBarIcon },
  { to: '/admin/queries',    label: 'Support Queries',  icon: ChatBubbleLeftRightIcon },
]

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar links={adminLinks} role="admin" />
      <main className="flex-1 overflow-auto">
        <div className="pt-14 lg:pt-0">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in">
            <Outlet />
          </div>
        </div>
      </main>
      <QueryChatBox />
    </div>
  )
}
