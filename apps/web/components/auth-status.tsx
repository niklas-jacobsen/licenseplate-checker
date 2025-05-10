'use client'

import { useAuth } from 'apps/web/lib/auth-context'
import { Button } from 'apps/web/components/ui/button'
import { Avatar, AvatarFallback } from 'apps/web/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'apps/web/components/ui/dropdown-menu'
import { LogOut, User, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AuthStatus() {
  const { user, logOut, isLoading } = useAuth()

  if (isLoading) {
    return <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
  }

  if (!user) {
    return (
      <div className="flex items-center">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/auth/login">Log In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/register">Sign Up</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-8 w-8 rounded-full"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-100 text-blue-800">
              {user.email?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{user.email}</p>
          </div>
        </div>

        <DropdownMenuSeparator />
        <div className="block md:hidden">
          {/* Mobile navigation items - only visible on small screens */}
          <DropdownMenuItem asChild>
            <Link
              href="/requests"
              className="cursor-pointer flex w-full items-center"
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              <span>My Requests</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/profile"
              className="cursor-pointer flex w-full items-center"
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </div>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            logOut()
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
