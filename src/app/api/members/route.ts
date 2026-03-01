import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Add a new member
export async function POST(request: NextRequest) {
  try {
    const { familyId, name, age, color } = await request.json();

    if (!familyId || !name || !color) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const member = await prisma.familyMember.create({
      data: {
        name,
        age: age ? parseInt(age) : null,
        color,
        familyId,
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a member
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID required" },
        { status: 400 }
      );
    }

    await prisma.familyMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update a member
export async function PUT(request: NextRequest) {
  try {
    const { memberId, name, age, color } = await request.json();

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID required" },
        { status: 400 }
      );
    }

    const member = await prisma.familyMember.update({
      where: { id: memberId },
      data: {
        name,
        age: age ? parseInt(age) : null,
        color,
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
