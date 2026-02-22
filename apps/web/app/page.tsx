'use client'

import NavBar from '../components/nav-bar'
import LicensePlateCheckForm from '../components/check-form'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
              License Plate Checker
            </h1>
            <p className="text-muted-foreground text-base max-w-md mx-auto">
              Enter your desired license plate and we'll automatically check its
              availability for you.
            </p>
          </div>
          <LicensePlateCheckForm />
        </div>
      </div>
    </main>
  )
}
