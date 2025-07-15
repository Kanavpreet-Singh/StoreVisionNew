"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react"; // Add this import for a spinner icon

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });

const cityCoords: Record<string, [number, number]> = {
  Delhi: [28.6139, 77.2090],
  Mumbai: [19.0760, 72.8777],
  Bangalore: [12.9716, 77.5946],
  Chandigarh: [30.7333, 76.7794],
  Hyderabad: [17.3850, 78.4867],
  Chennai: [13.0827, 80.2707],
  Kolkata: [22.5726, 88.3639],
  Pune: [18.5204, 73.8567],
  Jaipur: [26.9124, 75.7873],
  Lucknow: [26.8467, 80.9462],
};

export default function AddOrderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [city, setCity] = useState("Delhi");
  const [latLon, setLatLon] = useState<[number, number] | null>(null);
  const [form, setForm] = useState({
    address: "",
  });
  const [loading, setLoading] = useState(false); // Add loading state

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!latLon) return alert("Please select order location on the map");
    setLoading(true); // Start loading

    const payload = {
      address: form.address,
      lat: latLon[0],
      lon: latLon[1],
      city,
    };

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        if (err?.messages) {
          alert("Validation Error:\n" + err.messages.join("\n"));
        } else {
          alert("Something went wrong. Try again.");
        }
        setLoading(false); // Stop loading on error
        return;
      }

      const order = await res.json();
      alert(`Order placed and assigned to store: ${order.storeName}`);
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("Network error. Try again.");
      setLoading(false); // Stop loading on error
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Add a New Order</CardTitle>
            <CardDescription>
              Fill in the details below and click on the map to choose the order’s delivery location. The order will be assigned to the nearest store.
            </CardDescription>
          </CardHeader>

          <div className="p-6 space-y-6">
            {/* Address / Locality */}
            <div className="space-y-2">
              <Label htmlFor="address">Address or Locality</Label>
              <Input
                id="address"
                name="address"
                placeholder="e.g., Sector 64, Chandigarh"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            {/* City Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <select
                id="city"
                className="w-full px-3 py-2 border rounded bg-background text-foreground"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                {Object.keys(cityCoords).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Map */}
            <div className="h-[300px] rounded overflow-hidden border border-border">
              <MapPicker
                cityCenter={cityCoords[city]}
                latLon={latLon}
                setLatLon={setLatLon}
              />
            </div>

            {/* Lat/Lon Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat">Latitude</Label>
                <Input id="lat" value={latLon?.[0] || ""} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lon">Longitude</Label>
                <Input id="lon" value={latLon?.[1] || ""} readOnly />
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin w-5 h-5" />
                  Adding Order...
                </span>
              ) : (
                "Submit Order"
              )}
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
