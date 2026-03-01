import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Create a new family
export async function POST(request: NextRequest) {
  try {
    const { action, familyId, ...data } = await request.json();

    if (action === "create") {
      // Generate a unique 6-character family code
      const code = Math.random().toString(36).substr(2, 6).toUpperCase();

      const family = await prisma.family.create({
        data: { code },
        include: { members: true, events: true },
      });

      return NextResponse.json(family);
    }

    if (action === "join") {
      const { code } = data;
      const family = await prisma.family.findUnique({
        where: { code },
        include: { members: true, events: true },
      });

      if (!family) {
        return NextResponse.json(
          { error: "Family code not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(family);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get family data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get("familyId");
    const code = searchParams.get("code");

    let family;

    if (familyId) {
      family = await prisma.family.findUnique({
        where: { id: familyId },
        include: { members: true, events: true },
      });
    } else if (code) {
      family = await prisma.family.findUnique({
        where: { code },
        include: { members: true, events: true },
      });
    }

    if (!family) {
      return NextResponse.json(
        { error: "Family not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(family);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
