'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-40 w-full">
      <div className="container mx-auto flex justify-between items-center h-14 px-4 sm:px-6">
        <div className="flex space-x-1">
          <Link href="/profiles" passHref>
            <Button
              variant={pathname === '/profiles' ? 'default' : 'ghost'}
              className={`rounded-full font-medium text-sm ${pathname === '/profiles' ? 'bg-black text-white hover:bg-black/90' : ''}`}
              size="sm"
            >
              Profile
            </Button>
          </Link>
          <Link href="/chat" passHref>
            <Button
              variant={pathname.startsWith('/chat') ? 'default' : 'ghost'}
              className={`rounded-full font-medium text-sm ${pathname.startsWith('/chat') ? 'bg-black text-white hover:bg-black/90' : ''}`}
              size="sm"
            >
              Chat
            </Button>
          </Link>
        </div>
        
        {/* App Logo/Title (centered) */}
        <div className="absolute left-1/2 transform -translate-x-1/2 font-semibold text-foreground">
          AI Chat
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full text-red-500 hover:text-red-600 hover:bg-red-50/10 font-medium text-sm"
          onClick={() => {
            localStorage.removeItem('token')
            window.location.href = '/'
          }}
        >
          Sign Out
        </Button>
      </div>
    </nav>
  )
}