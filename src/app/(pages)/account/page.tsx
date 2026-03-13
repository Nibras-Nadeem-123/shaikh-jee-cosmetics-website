import { AccountPage } from '@/components/AccountPage'
import { Suspense } from 'react'

const page = () => {
  return (
      <div>
          <Suspense fallback={<div>Loading...</div>}>
              <AccountPage />
          </Suspense>
    </div>
  )
}

export default page