"use client"
import { Button } from "@/components/ui/button"
import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Star, MessageSquare, Send, ArrowLeft } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function ReviewPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  
  
  const [reviewText, setReviewText] = useState("")
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === "loading") return // Still loading
    if (!session) {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!session) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: reviewText, userId: session?.user?.id }),
    });

    if (!res.ok) throw new Error("Failed to submit review");

    const data = await res.json();
    console.log("Saved review:", data.review);

    setReviewText("");
    alert("Thank you for your review! It has been submitted successfully.");
  } catch (err: any) {
    console.error(err);
    alert("Something went wrong while submitting your review.");
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header Section */}
      <section className="px-4 py-12 bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-muted/50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-muted/50 border rounded-full px-4 py-2 mb-6">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Share Your Experience</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Leave a Review for <span className="text-primary">StoreVision</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Help us improve our platform by sharing your experience with StoreVision's retail analytics tools.
            </p>
          </div>
        </div>
      </section>

      {/* Review Form Section */}
      <section className="px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="border-border hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Write Your Review
              </CardTitle>
              <CardDescription>Your feedback helps us serve you and other retailers better.</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                

                {/* Review Text */}
                <div className="space-y-2">
                  <Label htmlFor="review" className="text-sm font-medium">
                    Your Review *
                  </Label>
                  <Textarea
                    id="review"
                    placeholder="Tell us about your experience with StoreVision. What features did you find most helpful? How has it impacted your business decisions?"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="min-h-32 border-border focus:ring-primary resize-none"
                    required
                  />
                  <p className="text-xs text-muted-foreground">{reviewText.length}/500 characters</p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={ !reviewText.trim() || isSubmitting} className="flex-1">
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Review
                      </>
                    )}
                  </Button>

                  <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Your review will be visible to other users and help improve our platform. We appreciate your honest
              feedback.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
