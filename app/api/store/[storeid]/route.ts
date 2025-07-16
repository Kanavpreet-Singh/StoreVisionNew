import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";




export async function DELETE(
  _request: Request,
  { params }: { params: { storeid: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const storeid = params.storeid;

  if (!storeid) {
    return NextResponse.json({ error: "Missing store ID" }, { status: 400 });
  }

  try {
    // 1. Check if store exists and is owned by current user
    const existingStore = await prisma.store.findUnique({
      where: { storeid },
    });

    if (!existingStore) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    if (existingStore.postedById !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Set isFulfilled = false and remove store reference from related orders
    await prisma.order.updateMany({
      where: { storeid },
      data: {
        isFulfilled: false,
        storeid: null,
      },
    });

    // 3. Delete the store
    await prisma.store.delete({
      where: { storeid },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[STORE_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

const storeSchema = z.object({
  name: z.string().min(2).max(100),
  city: z.string().min(2).max(100),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
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

export async function GET(
  _request: Request,
  { params }: { params: { storeid: string } }
) {
  try {
    const store = await prisma.store.findUnique({
      where: { storeid: params.storeid },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json(store, { status: 200 });
  } catch (err) {
    console.error("Error fetching store by ID:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


export async function PATCH(
  request: Request,
  { params }: { params: { storeid: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const storeid = params.storeid;

  if (!storeid) {
    return NextResponse.json({ error: "Missing store ID" }, { status: 400 });
  }

  try {
    const body = await request.json();

    // Validate input
    const validated = storeSchema.parse(body);

    // Check if store exists and is owned by current user
    const existingStore = await prisma.store.findUnique({
      where: { storeid },
    });

    if (!existingStore) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    if (existingStore.postedById !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update store
    const updatedStore = await prisma.store.update({
      where: { storeid },
      data: validated,
    });

    return NextResponse.json(updatedStore, { status: 200 });
  } catch (error) {
    console.error("[STORE_PATCH_ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation Failed", issues: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
