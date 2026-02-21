'use client'

import Link from 'next/link'
import Image from 'next/image'
import AuthStatus from './auth-status'

export default function NavBar() {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <Link href="/" className="flex items-center no-underline">
          <Image
            src="/logotype.svg"
            alt="Licenseplate Checker"
            width={328}
            height={34}
            priority
          />
        </Link>
        <nav className="ml-auto flex items-center">
          <ul className="hidden md:flex space-x-4 mr-4">
            <li className="text-sm font-medium text-gray-700 hover:text-blue-600">
              <Link href="/checks">My Requests</Link>
            </li>
            <li className="text-sm font-medium text-gray-700 hover:text-blue-600">
              <Link href="/workflows">Workflows</Link>
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
