'use client'

import NavBar from '../components/nav-bar'
import LicensePlateForm from '../components/request-form'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2">
            License Plate Reservation
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Enter license plate patterns and we'll automatically reserve them
            for you
          </p>
          <LicensePlateForm />
        </div>
      </div>
    </main>
  )
}
