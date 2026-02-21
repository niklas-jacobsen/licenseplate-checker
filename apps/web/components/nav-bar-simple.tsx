'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function SimpleNavBar() {
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
      </div>
    </header>
  )
}
