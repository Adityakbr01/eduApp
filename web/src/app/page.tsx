import ROUTES from '@/lib/CONSTANTS/ROUTES'
import Link from 'next/link'
import React from 'react'

function page() {
  return (
    <div>
      <Link href={ROUTES.AUTH.REGISTER_NEW_STUDENT}>Sign up User</Link>
      <br />
      <Link href={ROUTES.AUTH.REGISTER_NEW_INSTRUCTOR}>Sign up mentor</Link>
      <br />
      <Link href={ROUTES.AUTH.REGISTER_NEW_SUPPORT}>Sign up Support</Link>
      <br />
      <Link href={ROUTES.AUTH.REGISTER_NEW_MANAGER}>Sign up Manager</Link>
      <br />
    </div>
  )
}

export default page