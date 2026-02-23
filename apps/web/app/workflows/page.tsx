'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NavBar from '@/components/nav-bar'
import { useAuth } from '@/components/auth-context'
import WorkflowList from '@/components/workflow-list'

export default function WorkflowsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login?redirect=/workflows')
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
              Workflows
            </h1>
            <p className="text-muted-foreground text-base max-w-md mx-auto">
              Create and manage your automation workflows
            </p>
          </div>
          <WorkflowList />
        </div>
      </div>
    </main>
  )
}
