"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { MapPin, StoreIcon, Calendar, AlertCircle, RefreshCw, Search } from "lucide-react";

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
];

interface OrderData {
  orderid: string;
  lat: number;
  lon: number;
  city: string;
  addedAt: string;
  store: {
    storeid: string;
    name: string;
    city: string;
  };
}

export default function ViewOrdersPage() {
  const [city, setCity] = useState("");
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    if (!city) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/order?city=${encodeURIComponent(city)}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError("Something went wrong while fetching orders.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <main className="min-h-screen px-4 py-8 bg-background text-foreground">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <StoreIcon className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Order Directory</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            View all orders and see which store each order is assigned to. Select a city to filter orders.
          </p>
        </div>

        {/* Search Section */}
        <Card className="border-border shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Search className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl">Find Orders</CardTitle>
                <CardDescription>Select a city to view all orders in that location</CardDescription>
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
                    <SelectValue placeholder="Choose a city to explore orders" />
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
                <Button onClick={fetchOrders} disabled={!city || loading} className="h-11 px-8" size="lg">
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      View Orders
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
              <Button variant="outline" size="sm" onClick={fetchOrders} disabled={!city}>
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
                <h2 className="text-2xl font-semibold">Orders in {city}</h2>
                {!loading && orders.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {orders.length} {orders.length === 1 ? "order" : "orders"}
                  </Badge>
                )}
              </div>
            </div>

            {/* Orders Grid */}
            {!loading && !error && orders.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map((order) => (
                  <Card key={order.orderid} className="border-border hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <StoreIcon className="h-5 w-5 text-primary" />
                            Assigned Store: {order.store.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="h-4 w-4" />
                            {order.store.city}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Order Location</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Lat:</span>
                            <span className="font-mono">{order.lat.toFixed(4)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Lon:</span>
                            <span className="font-mono">{order.lon.toFixed(4)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Placed on {formatDate(order.addedAt)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && city && orders.length === 0 && (
              <Card className="border-dashed border-2 border-muted-foreground/25">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 bg-muted/50 rounded-full mb-4">
                    <StoreIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No orders found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    We couldn't find any orders in {city}. Try selecting a different city or check back later.
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
  );
}
