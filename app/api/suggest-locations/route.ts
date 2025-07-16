import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Types
type Point = { lat: number; lon: number };
type Order = {
  orderid: string;
  lat: number;
  lon: number;
};

// Utility: Haversine distance
function getDistanceKm(p1: Point, p2: Point): number {
  const R = 6371;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLon = ((p2.lon - p1.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Basic clustering algorithm (similar to DBSCAN)
function clusterOrders(orders: Order[], radius: number) {
  const clusters: Order[][] = [];
  const visited = new Set<string>();

  for (const order of orders) {
    if (visited.has(order.orderid)) continue;

    const cluster: Order[] = [order];
    visited.add(order.orderid);

    for (const other of orders) {
      if (visited.has(other.orderid)) continue;

      const dist = getDistanceKm(order, other);
      if (dist <= radius * 2) {
        cluster.push(other);
        visited.add(other.orderid);
      }
    }

    clusters.push(cluster);
  }

  // Convert each cluster into a center with percentage info
  return clusters.map(cluster => {
    const lat = cluster.reduce((sum, o) => sum + o.lat, 0) / cluster.length;
    const lon = cluster.reduce((sum, o) => sum + o.lon, 0) / cluster.length;
    return { lat, lon, count: cluster.length };
  });
}

// POST route
export async function POST(req: Request) {
  try {
    const { city, radius = 3 } = await req.json();

    if (!city) {
      return NextResponse.json({ error: "City is required" }, { status: 400 });
    }

    // Fetch unfulfilled orders in that city
    const unfulfilledOrders = await prisma.order.findMany({
      where: { isFulfilled: false, city },
      select: { orderid: true, lat: true, lon: true },
    });

    if (unfulfilledOrders.length === 0) {
      return NextResponse.json({ message: "No unfulfilled orders" }, { status: 200 });
    }

    const totalOrders = unfulfilledOrders.length;

    // Cluster them
    const suggestions = clusterOrders(unfulfilledOrders, radius)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // Top 5 suggestions
      .map(cluster => ({
        lat: cluster.lat,
        lon: cluster.lon,
        percentage: ((cluster.count / totalOrders) * 100).toFixed(2) + "%",
        covers: cluster.count,
      }));

    return NextResponse.json({
      totalUnfulfilledOrders: totalOrders,
      suggestions,
    });
  } catch (err) {
    console.error("[SUGGEST_LOCATION_ERROR]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
