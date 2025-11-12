"use client"

import ROUTES from '@/lib/CONSTANTS/ROUTES'
import { useAuthStore } from '@/store/auth'
import Link from 'next/link'
import React from 'react'

function Page() {

  //Extract user from zustand
  const user = useAuthStore((state) => state.user);
  console.log(user);

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

export default Page