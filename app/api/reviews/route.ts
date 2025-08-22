import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

const HUGGINGFACE_API_URL =
  "https://api-inference.huggingface.co/models/siebert/sentiment-roberta-large-english";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, userId } = body;

    if (!content || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Call Hugging Face Inference API
    const hfResponse = await fetch(HUGGINGFACE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: content }),
    });

    const hfData = await hfResponse.json();

    let sentiment = "NEUTRAL";

    if (
      hfData &&
      Array.isArray(hfData) &&
      hfData[0] &&
      Array.isArray(hfData[0]) &&
      hfData[0].length >= 2
    ) {
      const first = hfData[0][0];
      const second = hfData[0][1];

      // If the second label has a non-negligible score, classify as NEUTRAL
      if (second.score > 0.01) {
        sentiment = "NEUTRAL";
      } else {
        // Otherwise use the first label
        if (first.label === "POSITIVE") sentiment = "POSITIVE";
        else if (first.label === "NEGATIVE") sentiment = "NEGATIVE";
      }
    }

    // Store review in database
    const review = await prisma.review.create({
      data: {
        content,
        sentiment,
        userId,
      },
    });

    return NextResponse.json({ review });
  } catch (error: any) {
    console.error("Error creating review:", error.response?.data || error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


export async function GET(req: NextRequest) {
  try {
    // Fetch all reviews from the database
    const reviews = await prisma.review.findMany({
      orderBy: {
        createdAt: "desc", // latest reviews first
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error("Error fetching reviews:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}