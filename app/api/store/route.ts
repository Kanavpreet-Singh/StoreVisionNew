import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

// Zod schema to validate incoming store data
const storeSchema = z.object({
  name: z.string().min(2).max(100),
  city: z.string().min(2).max(100),
  lat: z.number().min(-90).max(90), // valid latitude range
  lon: z.number().min(-180).max(180), // valid longitude range
  deliveryRadiusKm: z
    .number()
    .min(0.1, { message: "Delivery radius must be at least 0.1 km" })
    .max(50, { message: "Delivery radius can't exceed 50 km" })
    .optional(),
  avgDailyCustomers: z
    .number()
    .min(0, { message: "Customer count can't be negative" })
    .max(100000, { message: "Too large customer number" })
    .optional(),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate the body
    const validated = storeSchema.parse(body);

    const store = await prisma.store.create({
      data: {
        ...validated,
        postedById: session.user.id,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.error("[STORE_POST_ERROR]", error);

    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ error: "Validation Failed", issues: error.issues }),
        { status: 400 }
      );
    }

    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");

  try {
    const stores = await prisma.store.findMany({
      where: city ? { city: { equals: city, mode: "insensitive" } } : undefined,
      orderBy: { addedAt: "desc" },
    });

    return NextResponse.json(stores, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch stores" }, { status: 500 });
  }
}
