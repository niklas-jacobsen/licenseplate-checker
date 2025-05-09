'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function LoginRedirect({
  onResolve,
}: {
  onResolve: (redirectTo: string) => void
}) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const redirect = searchParams.get('redirect') || '/'
    onResolve(redirect)
  }, [searchParams, onResolve]) // ✅ ensure effect runs when params change

  return null
}
