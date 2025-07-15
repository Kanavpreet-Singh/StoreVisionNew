"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/theme-toggle"
import { Menu, X } from "lucide-react"
import { useSession } from "next-auth/react"
import { logout } from "@/lib/auth"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  const {data:session}=useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity"
            onClick={closeMenu}
          >
            <span>📦</span>
            <span>StoreVision</span>
          </Link>

          {/* Desktop buttons */}
          <nav className="hidden lg:flex items-center gap-2">
            <ThemeToggle />
            {session? <>
            <Link href="/predictor">
              <Button size="sm" variant="outline">Predictor</Button>
            </Link>

            
              <Button onClick={logout} size="sm" variant="outline">Sign Out</Button>
            
            
            </> : <Link href="/auth/signin">
              <Button size="sm">Sign In</Button>
            </Link>}
            
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile drawer menu */}
        {isOpen && (
          <div className="lg:hidden mt-3 border-t">
            <div className="px-2 pt-4 pb-3 space-y-2">
              {session? <Link href="/predictor">
              <Button size="sm" variant="outline">Predictor</Button>
            </Link> : <Link href="/auth/signin">
              <Button size="sm">Sign In</Button>
            </Link>}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
