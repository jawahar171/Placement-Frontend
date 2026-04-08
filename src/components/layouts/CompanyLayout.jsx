import { Outlet } from 'react-router-dom'
import Sidebar from '../common/Sidebar'
import {
  HomeIcon, PlusCircleIcon, BriefcaseIcon,
  DocumentTextIcon, CalendarIcon, BuildingOffice2Icon
} from '@heroicons/react/24/outline'

const companyLinks = [
  { to: '/company',              label: 'Dashboard',      icon: HomeIcon },
  { to: '/company/post-job',     label: 'Post a Job',     icon: PlusCircleIcon },
  { to: '/company/jobs',         label: 'My Listings',    icon: BriefcaseIcon },
  { to: '/company/applications', label: 'Applications',   icon: DocumentTextIcon },
  { to: '/company/interviews',   label: 'Interviews',     icon: CalendarIcon },
  { to: '/company/profile',      label: 'Company Profile',icon: BuildingOffice2Icon },
]

export default function CompanyLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar links={companyLinks} role="company" />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6 lg:p-8 animate-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
