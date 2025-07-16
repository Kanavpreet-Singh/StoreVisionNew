'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

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


export default function AddStorePage() {
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [city, setCity] = useState('Delhi');
  const [latLon, setLatLon] = useState<[number, number] | null>(null);

  const [form, setForm] = useState({
    name: '',
    address: '', // added
    deliveryRadiusKm: '',
    avgDailyCustomers: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async () => {
  if (!latLon) return alert('Please select store location on the map');

  const finalName = `${form.name}, ${form.address}`;

  const payload = {
    name: finalName,
    lat: latLon[0],
    lon: latLon[1],
    city,
    deliveryRadiusKm: Number(form.deliveryRadiusKm),
    avgDailyCustomers: Number(form.avgDailyCustomers),
  };

  try {
    setLoading(true); // show loader

    // 1. Add new store
    const res = await fetch('/api/store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      if (err?.messages) {
        alert('Validation Error:\n' + err.messages.join('\n'));
      } else {
        alert('Something went wrong. Try again.');
      }
      return;
    }

    const store = await res.json();

    // 2. Call reassignment API
    const reassign = await fetch('/api/reassign-orders', {
      method: 'POST',
    });

    if (!reassign.ok) {
      const err = await reassign.json();
      alert(`Store "${store.name}" added, but order reassignment failed: ${err?.error || 'Unknown error'}`);
    } else {
      const result = await reassign.json();
      alert(`Store "${store.name}" added successfully!\n${result.message}`);
    }

    // 3. Redirect
    router.push('/');
  } catch (err) {
    console.error(err);
    alert('Network error. Try again.');
  } finally {
    setLoading(false); // hide loader
  }
};


  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Add a New Store</CardTitle>
            <CardDescription>
              Fill in the details below and click on the map to choose the store’s exact location.
            </CardDescription>
          </CardHeader>

          <div className="p-6 space-y-6">
            {/* Store Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Store Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Vishal Mega Mart"
                value={form.name}
                onChange={handleChange}
              />
            </div>

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
                <Input id="lat" value={latLon?.[0] || ''} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lon">Longitude</Label>
                <Input id="lon" value={latLon?.[1] || ''} readOnly />
              </div>
            </div>

            {/* Radius and Customers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryRadiusKm">Delivery Radius (km)</Label>
                <Input
                  id="deliveryRadiusKm"
                  name="deliveryRadiusKm"
                  type="number"
                  placeholder="e.g., 3"
                  value={form.deliveryRadiusKm}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avgDailyCustomers">Avg Daily Customers</Label>
                <Input
                  id="avgDailyCustomers"
                  name="avgDailyCustomers"
                  type="number"
                  placeholder="e.g., 150"
                  value={form.avgDailyCustomers}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Store'
              )}
            </Button>

          </div>
        </Card>
      </div>
    </main>
  );
}
