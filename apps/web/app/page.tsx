import Link from 'next/link'
import { Car } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Link href="/" className="flex items-center no-underline">
            <Car className="h-6 w-6 text-blue-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-900">
              Licenseplate Checker
            </h1>
          </Link>
          <nav className="ml-auto flex items-center">
            <ul className="hidden md:flex space-x-4 mr-4">
              <li className="text-sm font-medium text-gray-700 hover:text-blue-600">
                <Link href="/requests">My Requests</Link>
              </li>
              <li className="text-sm font-medium text-gray-700 hover:text-blue-600">
                <Link href="/profile">Profile</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2">
            License Plate Reservation
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Enter license plate patterns and we'll automatically reserve them
            for you
          </p>
        </div>
      </div>
    </main>
  )
}
