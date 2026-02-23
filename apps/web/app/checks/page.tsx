'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NavBar from '@/components/nav-bar'
import { useAuth } from '@/components/auth-context'
import LicensePlateCheckDashboard from '@/components/check-dashboard'

export default function ChecksPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login?redirect=/checks')
    }
  }, [user, isLoading, router])

  if (isLoading || !user) return null

  return (
    <main className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
              My Requests
            </h1>
            <p className="text-muted-foreground text-base max-w-md mx-auto">
              View and manage the requests you created
            </p>
          </div>
          <LicensePlateCheckDashboard />
        </div>
      </div>
    </main>
  )
}
