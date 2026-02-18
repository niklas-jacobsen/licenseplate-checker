'use client'

import Link from 'next/link'
import { Car } from 'lucide-react'
import AuthStatus from './auth-status'

export default function NavBar() {
  return (
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
              <Link href="/checks">My Requests</Link>
            </li>
            <li className="text-sm font-medium text-gray-700 hover:text-blue-600">
              <Link href="/builder">Builder</Link>
            </li>
            <li className="text-sm font-medium text-gray-700 hover:text-blue-600 hidden md:block">
              <Link href="/profile">Profile</Link>
            </li>
          </ul>
          <AuthStatus />
        </nav>
      </div>
    </header>
  )
}
