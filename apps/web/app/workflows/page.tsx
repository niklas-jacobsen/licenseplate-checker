'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NavBar from '@/components/nav-bar'
import { useAuth } from '@/lib/auth-context'
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
          <h2 className="text-2xl font-bold text-center mb-2">Workflows</h2>
          <p className="text-gray-600 text-center mb-8">
            Create and manage your automation workflows
          </p>
          <WorkflowList />
        </div>
      </div>
    </main>
  )
}
