import { AdminDashboard } from '@/components/AdminDashboard'
import { AdminGuard } from '@/components/RoleGuard'
import React from 'react'

const page = () => {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  )
}

export default page