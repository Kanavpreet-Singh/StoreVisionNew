import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Haversine formula to calculate distance in KM between two points
function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Radius of Earth in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST() {
  try {
    const unfulfilledOrders = await prisma.order.findMany({
      where: {
        isFulfilled: false,
      },
    });

    const allStores = await prisma.store.findMany({
      where: {
        isActive: true,
      },
    });

    let reassignedCount = 0;

    for (const order of unfulfilledOrders) {
      const cityStores = allStores.filter(store => store.city === order.city);

      let closestStore = null;
      let minDistance = Infinity;

      for (const store of cityStores) {
        const distance = getDistanceInKm(order.lat, order.lon, store.lat, store.lon);
        if (
          store.deliveryRadiusKm &&
          distance <= store.deliveryRadiusKm &&
          distance < minDistance
        ) {
          closestStore = store;
          minDistance = distance;
        }
      }

      if (closestStore) {
        await prisma.order.update({
          where: { orderid: order.orderid },
          data: {
            isFulfilled: true,
            storeid: closestStore.storeid,
          },
        });
        reassignedCount++;
      }
    }

    return NextResponse.json({
      message: `${reassignedCount} orders reassigned successfully.`,
    });
  } catch (err) {
    console.error('[REASSIGN_ORDERS_ERROR]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
