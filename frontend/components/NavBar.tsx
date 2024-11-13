'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Link href="/profiles" passHref>
            <Button
              variant={pathname === '/profiles' ? 'secondary' : 'ghost'}
              className="text-white hover:text-gray-300"
            >
              Profile
            </Button>
          </Link>
          <Link href="/chat" passHref>
            <Button
              variant={pathname === '/chat' ? 'secondary' : 'ghost'}
              className="text-white hover:text-gray-300"
            >
              Chat
            </Button>
          </Link>
        </div>
        <Button
          variant="ghost"
          className="text-white hover:text-gray-300"
          onClick={() => {
            localStorage.removeItem('token')
            window.location.href = '/'
          }}
        >
          Logout
        </Button>
      </div>
    </nav>
  )
}