import { LoginPage } from '@/components/loginPage'
import React, { Suspense } from 'react'

const page = () => {
  return (
      <div>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
          <LoginPage />
        </Suspense>
    </div>
  )
}

export default page
