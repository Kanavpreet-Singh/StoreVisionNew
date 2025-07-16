"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StoreIcon, MapPin, Users, Radius, Calendar, Search, Building2, AlertCircle, RefreshCw } from "lucide-react"

const cityOptions = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Chandigarh",
  "Hyderabad",
  "Kolkata",
  "Chennai",
  "Pune",
  "Ahmedabad",
]

interface StoreData {
  storeid: string
  name: string
  lat: number
  lon: number
  deliveryRadiusKm?: number
  avgDailyCustomers?: number
  city: string
  addedAt: string
  isActive: boolean
  postedById: string;
}

export default function ViewStoresPage() {
  const [city, setCity] = useState("")
  const [reassigning, setReassigning] = useState(false);

  const { data: session, status } = useSession();
  const router = useRouter();
  const [stores, setStores] = useState<StoreData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // useEffect(() => {
  //     if (status === 'unauthenticated') {
  //       router.push('/auth/signin');
  //     }
  //   }, [status, router]);

  const fetchStores = async () => {
    if (!city) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/store?city=${encodeURIComponent(city)}`)
      if (!res.ok) throw new Error("Failed to fetch stores")
      const data = await res.json()
      setStores(data)
    } catch (err) {
      setError("Something went wrong while fetching stores.")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const StoreCardSkeleton = () => (
    <Card className="border-border">
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  )

  const handleDeleteStore = async (storeId: string) => {
  const confirmDelete = confirm(
    "Are you sure you want to delete this store? This action cannot be undone."
  );
  if (!confirmDelete) return;

  try {
    setReassigning(true);

    const res = await fetch(`/api/store/${storeId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to delete store");
      return;
    }

    // Remove from UI
    setStores((prev) => prev.filter((s) => s.storeid !== storeId));

    // Trigger reassignment
    const reassign = await fetch(`/api/reassign-orders`, {
      method: "POST",
    });

    if (!reassign.ok) {
      const err = await reassign.json();
      console.warn("Some orders might not be reassigned:", err.error);
      alert("Store deleted, but some orders might not be reassigned.");
    } else {
      const result = await reassign.json();
      alert(result.message || "Store deleted and orders reassigned.");
    }
  } catch (e) {
    alert("Error deleting store or reassigning orders.");
    console.error(e);
  } finally {
    setReassigning(false);
  }
};




  return (
    <main className="min-h-screen px-4 py-8 bg-background text-foreground">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Store Directory</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover and explore stores across different cities. Select a city to view all available store locations.
          </p>
        </div>

        {/* Search Section */}
        <Card className="border-border shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Search className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl">Find Stores</CardTitle>
                <CardDescription>Select a city to view all stores in that location</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="city" className="text-sm font-medium">
                  Select City
                </Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choose a city to explore stores" />
                  </SelectTrigger>
                  <SelectContent>
                    {cityOptions.map((c) => (
                      <SelectItem key={c} value={c}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {c}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={fetchStores} disabled={!city || loading} className="h-11 px-8" size="lg">
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      View Stores
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={fetchStores} disabled={!city}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Results Section */}
        {city && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">Stores in {city}</h2>
                {!loading && stores.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {stores.length} {stores.length === 1 ? "store" : "stores"}
                  </Badge>
                )}
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <StoreCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Stores Grid */}
            {!loading && !error && stores.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((store) => (
                  <Card
                    key={store.storeid}
                    className={`border-border hover:shadow-lg transition-shadow duration-200 ${
                      !store.isActive ? "opacity-75 bg-muted/30" : ""
                    }`}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <StoreIcon className="h-5 w-5 text-primary" />
                            {store.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="h-4 w-4" />
                            {store.city}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            variant={store.isActive ? "default" : "secondary"}
                            className={
                              store.isActive ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"
                            }
                          >
                            {store.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Location Info */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Location</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Lat:</span>
                            <span className="font-mono">{store.lat.toFixed(4)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Lon:</span>
                            <span className="font-mono">{store.lon.toFixed(4)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Business Info */}
                      {(store.deliveryRadiusKm !== null || store.avgDailyCustomers !== null) && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            Business Details
                          </h4>
                          <div className="space-y-2">
                            {store.deliveryRadiusKm !== null && (
                              <div className="flex items-center gap-2 text-sm">
                                <Radius className="h-4 w-4 text-muted-foreground" />
                                <span>Delivery Radius: </span>
                                <Badge variant="outline">{store.deliveryRadiusKm} km</Badge>
                              </div>
                            )}
                            {store.avgDailyCustomers !== null && (
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>Daily Customers: </span>
                                <Badge variant="outline">{store.avgDailyCustomers}</Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Status Info */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Status</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <div className={`h-2 w-2 rounded-full ${store.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                          <span
                            className={
                              store.isActive ? "text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-400"
                            }
                          >
                            {store.isActive
                              ? "Store is operational and accepting orders"
                              : "Store is currently not operational"}
                          </span>
                        </div>
                      </div>

                      {/* Added Date */}
                      <div className="pt-2 border-t border-border">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Added on {formatDate(store.addedAt)}
                        </div>
                      </div>

                      {/* Edit/Delete Buttons if owned by user */}
                      {session?.user?.id === store.postedById && (
                        <div className="pt-4 border-t border-border flex gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/store/edit/${store.storeid}`)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteStore(store.storeid)}
                            disabled={reassigning}
                          >
                            {reassigning ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Reassigning...
                              </>
                            ) : (
                              "Delete"
                            )}
                          </Button>

                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && city && stores.length === 0 && (
              <Card className="border-dashed border-2 border-muted-foreground/25">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 bg-muted/50 rounded-full mb-4">
                    <StoreIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No stores found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    We couldn't find any stores in {city}. Try selecting a different city or check back later.
                  </p>
                  <Button variant="outline" onClick={() => setCity("")}>
                    <Search className="h-4 w-4 mr-2" />
                    Search Another City
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
