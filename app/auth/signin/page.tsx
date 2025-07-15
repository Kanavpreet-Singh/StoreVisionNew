"use client"
import { Button } from "@/components/ui/button"
import { login } from "@/lib/auth"
import { Github } from "lucide-react"
import Link from "next/link"

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <div className="bg-muted p-8 rounded-xl shadow-md w-full max-w-sm text-center border border-border">
        <h1 className="text-2xl font-bold mb-2">Welcome to StoreVision</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Sign in to upload data or explore predictions
        </p>

        {/* GitHub Sign-In */}
        
          <Button variant="outline" className="w-full" onClick={login}>
            <Github className="mr-2 h-4 w-4" />
            Continue with GitHub
          </Button>
        

        {/* Terms and Privacy */}
        <p className="text-xs text-muted-foreground mt-6">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-primary">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  )
}
