
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
import { useSession } from "next-auth/react";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find the user by email to get their id
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Fetch stores where postedById matches the user's id
  const stores = await prisma.store.findMany({
    where: { postedById: user.id },
    select: {
      storeid: true,
      name: true,
     
      city: true,
      addedAt: true,
      isActive: true,
    },
    orderBy: { addedAt: "desc" },
  });

  return NextResponse.json({ stores });
}