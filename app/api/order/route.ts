export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    if (!city) {
      return NextResponse.json([], { status: 200 });
    }
    const orders = await prisma.order.findMany({
      where: { city },
      orderBy: { addedAt: 'desc' },
      include: {
        store: {
          select: {
            storeid: true,
            name: true,
            city: true,
          },
        },
      },
    });
    return NextResponse.json(orders);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ messages: ['Internal server error'] }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to calculate distance between two lat/lon points (Haversine formula)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export async function POST(req: NextRequest) {
  try {
    const { lat, lon, city } = await req.json();
    if (!lat || !lon || !city) {
      return NextResponse.json({ messages: ['Missing required fields'] }, { status: 400 });
    }

    // Find all active stores in the city
    const stores = await prisma.store.findMany({
      where: { city, isActive: true },
    });

    let nearestStore = null;
    let minDist = Infinity;

    for (const store of stores) {
      const dist = getDistanceFromLatLonInKm(lat, lon, store.lat, store.lon);
      if (
        dist < minDist &&
        (store.deliveryRadiusKm == null || dist <= store.deliveryRadiusKm)
      ) {
        minDist = dist;
        nearestStore = store;
      }
    }

    const order = await prisma.order.create({
      data: {
        lat,
        lon,
        city,
        isFulfilled: nearestStore ? true : false,
        storeid: nearestStore?.storeid ?? null, 
      },
    });

    return NextResponse.json({
      ...order,
      storeName: nearestStore?.name ?? null,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ messages: ['Internal server error'] }, { status: 500 });
  }
}

