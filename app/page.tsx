"use client"
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Store,
  ShoppingCart,
  LogIn,
  BarChart3,
  MapPin,
  TrendingUp,
  Upload,
  Users,
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
  MessageSquare,
} from "lucide-react"
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
interface Review {
  id: string
  content: string
  sentiment: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}
export default function Home() {
  const router = useRouter()
  const {data:session}=useSession();
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch("/api/reviews")
        const data = await response.json()
        setReviews(data.reviews || [])
      } catch (error) {
        console.error("Error fetching reviews:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment.toUpperCase()) {
      case "POSITIVE":
        return "😊"
      case "NEGATIVE":
        return "😞"
      case "NEUTRAL":
        return "😐"
      default:
        return "💭"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="px-4 py-20 bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-muted/50 border rounded-full px-4 py-2 mb-8">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Smart Retail Analytics Platform</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Make Smarter Retail Decisions with <span className="text-primary">StoreVision</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your retail strategy with smart insights. Upload order data, analyze local demand patterns,
            and discover the perfect locations for your next successful store.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            {!session? <Button onClick={()=>{router.push("/auth/signin")}} size="lg" className="group">
              <Upload className="w-5 h-5 mr-2" />
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>:<></>}
            <Button onClick={()=>{router.push("/store/view")}} size="lg" variant="outline">
              <BarChart3 className="w-5 h-5 mr-2" />
              View Stores
            </Button>
            <Button onClick={()=>{router.push("/order/view")}} size="lg" variant="outline">
              <BarChart3 className="w-5 h-5 mr-2" />
              View Orders
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">95%</div>
              <div className="text-sm text-muted-foreground">Location Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">2.5x</div>
              <div className="text-sm text-muted-foreground">ROI Improvement</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Successful Stores</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to expand smartly</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful analytics tools designed to help retailers make data-driven location decisions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-300 border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">Easy Data Upload</CardTitle>
                <CardDescription>
                  Simply upload your order history and sales data. We support CSV, Excel, and direct integrations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">Demand Analysis</CardTitle>
                <CardDescription>
                  Advanced algorithms analyze local demand patterns and identify high-potential markets for expansion.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">Location Intelligence</CardTitle>
                <CardDescription>
                  Get precise recommendations for store locations based on demographics, competition, and foot traffic.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">Visual Analytics</CardTitle>
                <CardDescription>
                  Interactive dashboards and heat maps make complex data easy to understand and act upon.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">Customer Insights</CardTitle>
                <CardDescription>
                  Understand your customer base and identify untapped segments in different geographic areas.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">Real-time Updates</CardTitle>
                <CardDescription>
                  Stay ahead with real-time market changes and updated recommendations as new data becomes available.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real feedback from retailers who have transformed their business with StoreVision
            </p>
          </div>

          {loading ? (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                Loading reviews...
              </div>
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.slice(0, 6).map((review) => (
                <Card key={review.id} className="hover:shadow-lg transition-shadow duration-300 border-border">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{review.user.name}</h4>
                          <p className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-2xl">{getSentimentEmoji(review.sentiment)}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {review.sentiment.toLowerCase()}
                        </span>
                      </div>
                    </div>
                    <CardDescription className="text-foreground leading-relaxed">"{review.content}"</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
              {session && (
                <Button onClick={() => router.push("/review")} className="mt-4">
                  Write a Review
                </Button>
              )}
            </div>
          )}

          {reviews.length > 0 && (
            <div className="text-center mt-12">
              <Button onClick={() => router.push("/review")} size="lg" variant="outline">
                <Star className="w-5 h-5 mr-2" />
                {session ? "Write a Review" : "Sign in to Write a Review"}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="px-4 py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How StoreVision Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get actionable insights in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Upload Your Data</h3>
              <p className="text-muted-foreground">
                Import your sales data, order history, and customer information through our secure platform.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">In-depth Analysis</h3>
              <p className="text-muted-foreground">
                Our advanced algorithms analyze patterns, demographics, and market opportunities in real-time.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Get Recommendations</h3>
              <p className="text-muted-foreground">
                Receive detailed location recommendations with confidence scores and ROI projections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose StoreVision?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join hundreds of retailers who have transformed their expansion strategy with data-driven insights.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Reduce Risk</h4>
                    <p className="text-muted-foreground">
                      Make informed decisions backed by comprehensive market analysis
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Save Time</h4>
                    <p className="text-muted-foreground">
                      Automate location research that traditionally takes weeks or months
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Increase ROI</h4>
                    <p className="text-muted-foreground">
                      Optimize store placement for maximum profitability and growth
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Call-to-Action Panel */}
        <div className="bg-muted/50 rounded-lg p-8 border border-border flex flex-col items-center text-center">
          <BarChart3 className="w-16 h-16 text-primary mb-6" />
          <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Upload your first dataset and see the power of StoreVision in action.
          </p>

          {!session ? (
            <Button onClick={() => router.push("/auth/signin")} size="lg">
              <LogIn className="w-5 h-5 mr-2" />
              Start Free Trial
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => router.push("/store/add")} size="lg">
                <Store className="w-5 h-5 mr-2" />
                Add Store
              </Button>
              <Button onClick={() => router.push("/order/add")} size="lg">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add Order
              </Button>
            </div>
          )}
        </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to find your next winning location?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join hundreds of retailers who have transformed their expansion strategy with StoreVision.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!session?<Button onClick={()=>{router.push("/auth/signin")}} size="lg">Get Started Free</Button>:<></>}
            <Button onClick={()=>{router.push("/predictor")}} size="lg" variant="outline">
              Go to predictor
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
