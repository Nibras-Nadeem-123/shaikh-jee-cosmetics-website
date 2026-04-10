import { AccountPage } from '@/components/AccountPage'
import { AuthGuard } from '@/components/RoleGuard'
import { Suspense } from 'react'

const page = () => {
  return (
    <AuthGuard fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-muted-foreground">Loading...</p></div></div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <AccountPage />
      </Suspense>
    </AuthGuard>
  )
}

export default page