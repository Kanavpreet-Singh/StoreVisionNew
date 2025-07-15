"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/theme-toggle"
import { Menu, X } from "lucide-react"
import { useSession } from "next-auth/react"
import { logout } from "@/lib/auth"
import { UserCircle } from "lucide-react"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)
  const toggleUserMenu = () => setUserMenuOpen((v) => !v)
  const closeUserMenu = () => setUserMenuOpen(false)

  const { data: session } = useSession()

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
            <Link href="/predictor">
              <Button size="sm" variant="outline">Predictor</Button>
            </Link>
            {session ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleUserMenu}
                  aria-label="User menu"
                  className="h-10 w-10"
                >
                  <UserCircle className="h-8 w-8" />
                </Button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-background border rounded shadow-lg z-50">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 hover:bg-muted-foreground/10"
                      onClick={closeUserMenu}
                    >
                      My Dashboard
                    </Link>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-muted-foreground/10"
                      onClick={() => {
                        logout();
                        closeUserMenu();
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/signin">
                <Button size="sm">Sign In</Button>
              </Link>
            )}
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
              <ThemeToggle  />
              <Link href="/predictor">
                <Button size="sm" variant="outline" className="w-full">Predictor</Button>
              </Link>
              {session ? (
                <div className="space-y-2">
                  <Link href="/dashboard">
                    <Button size="sm" variant="outline" className="w-full">
                      My Dashboard
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={logout}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link href="/auth/signin">
                  <Button size="sm" className="w-full">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
