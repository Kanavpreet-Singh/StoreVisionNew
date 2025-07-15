'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function EditStorePage() {
  const router = useRouter();
  const params = useParams();
    const storeid = params.storeid as string;

  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('Delhi');
  const [latLon, setLatLon] = useState<[number, number] | null>(null);

  const [form, setForm] = useState({
    name: '',
    address: '',
    deliveryRadiusKm: '',
    avgDailyCustomers: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (!storeid) return;
    const fetchStore = async () => {
      try {
        const res = await fetch(`/api/store/${storeid}`);
        if (!res.ok) throw new Error('Failed to fetch store');
        const store = await res.json();

        const [name, ...rest] = store.name.split(', ');
        const address = rest.join(', ');

        setForm({
          name,
          address,
          deliveryRadiusKm: store.deliveryRadiusKm?.toString() || '',
          avgDailyCustomers: store.avgDailyCustomers?.toString() || '',
        });

        setCity(store.city);
        setLatLon([store.lat, store.lon]);
      } catch (err) {
        console.error(err);
        alert('Error loading store data');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [storeid, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    if (!latLon || !storeid) return alert('Location or ID missing');

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
      const res = await fetch(`/api/store/${storeid}`, {
        method: 'PATCH', 
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

      alert('Store updated successfully!');
      router.push('/store/view');
    } catch (err) {
      console.error(err);
      alert('Network error. Try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-10 max-w-3xl mx-auto">
        <Skeleton className="h-6 w-1/3 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Edit Store</CardTitle>
            <CardDescription>
              Update the store details and click on the map to adjust location if needed.
            </CardDescription>
          </CardHeader>

          <div className="p-6 space-y-6">
            {/* Store Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Store Name</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            {/* City */}
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

            {/* Lat/Lon */}
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
                  value={form.avgDailyCustomers}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={handleUpdate}>
              Update Store
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
