'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/components/auth-context'
import { Button } from '@/components/ui/button'

export default function LandingNav() {
  const { user, isLoading } = useAuth()

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 h-16 flex items-center">
        <Link href="/" className="flex items-center no-underline">
          <Image
            src="/logotype.svg"
            alt="Licenseplate Checker"
            width={84}
            height={36}
            priority
          />
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {isLoading ? (
            <div className="h-8 w-32 rounded-md bg-gray-100 animate-pulse" />
          ) : user ? (
            <Button size="sm" asChild>
              <Link href="/checks">Open app</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
