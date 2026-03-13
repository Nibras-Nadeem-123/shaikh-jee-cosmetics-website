import { ShopPageComponent } from '@/components/shop'
import React, { Suspense } from 'react'

const page = () => {
  return (
      <div>
          <Suspense fallback={<div>Loading...</div>}>
              <ShopPageComponent />
          </Suspense>
    </div>
  )
}

export default page