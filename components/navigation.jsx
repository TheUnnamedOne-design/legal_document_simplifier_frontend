"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Shield, Menu, FileText, MessageSquare, AlertTriangle, BookOpen } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navigation({ showServices = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const serviceLinks = [
    {
      href: "/simplify-clause",
      label: "Simplify Clause",
      icon: BookOpen,
    },
    {
      href: "/summarisation",
      label: "Summarisation",
      icon: FileText,
    },
    {
      href: "/query",
      label: "Query",
      icon: MessageSquare,
    },
    {
      href: "/risk-checking",
      label: "Risk Checking",
      icon: AlertTriangle,
    },
  ]

  const isActive = (href) => pathname === href

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">LegalAI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              href="/upload"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/upload") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Upload
            </Link>

            {/* Service Links - Only show if enabled */}
            {showServices && (
              <>
                {serviceLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-primary flex items-center space-x-1 ${
                      isActive(link.href) ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <link.icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  <Link
                    href="/"
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      isActive("/") ? "text-primary" : "text-muted-foreground"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/upload"
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      isActive("/upload") ? "text-primary" : "text-muted-foreground"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    Upload
                  </Link>

                  {/* Mobile Service Links */}
                  {showServices && (
                    <>
                      <div className="border-t border-border pt-4 mt-4">
                        <p className="text-xs font-medium text-muted-foreground mb-3">SERVICES</p>
                        {serviceLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary py-2 ${
                              isActive(link.href) ? "text-primary" : "text-muted-foreground"
                            }`}
                            onClick={() => setIsOpen(false)}
                          >
                            <link.icon className="h-4 w-4" />
                            <span>{link.label}</span>
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
