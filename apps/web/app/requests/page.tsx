'use client'

import NavBar from 'apps/web/components/nav-bar'
import LicensePlateRequests from 'apps/web/components/request-dashboard'

export default function RequestsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2">My Requests</h2>
          <p className="text-gray-600 text-center mb-8">
            View and manage the requests you created
          </p>
          <LicensePlateRequests />
        </div>
      </div>
    </main>
  )
}
