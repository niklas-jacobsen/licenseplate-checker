'use client'

import { useEffect } from 'react'
import NavBar from '@/components/nav-bar'
import { useAuth } from '@/components/auth-context'
import { useRouter } from 'next/navigation'
import ProfileForm from '@/components/profile-form'

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login?redirect=/profile')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">Your Profile</h2>
          <p className="text-gray-600 mb-8">
            Your personal information is used when automatically making
            reservations on your behalf
          </p>

          <ProfileForm />
        </div>
      </div>
    </main>
  )
}
