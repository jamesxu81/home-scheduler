import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Add a new event
export async function POST(request: NextRequest) {
  try {
    const {
      familyId,
      title,
      description,
      date,
      time,
      kidId,
      category,
      reminder,
      repeatType,
      repeatUntil,
    } = await request.json();

    console.log("Creating event:", { familyId, title, date, time, kidId, category, repeatType });

    if (!familyId || !title || !date || !time || !kidId) {
      return NextResponse.json(
        { error: "Missing required fields", received: { familyId, title, date, time, kidId } },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        description: description || "",
        date,
        time,
        kidId,
        category: category || "other",
        reminder: reminder || false,
        repeatType: repeatType || "NONE",
        repeatUntil: repeatUntil || null,
        familyId,
      },
    });

    console.log("Event created successfully:", event);
    return NextResponse.json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Get events for a family
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get("familyId");

    if (!familyId) {
      return NextResponse.json(
        { error: "Family ID required" },
        { status: 400 }
      );
    }

    const events = await prisma.event.findMany({
      where: { familyId },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update an event
export async function PUT(request: NextRequest) {
  try {
    const {
      eventId,
      title,
      description,
      date,
      time,
      kidId,
      category,
      reminder,
      repeatType,
      repeatUntil,
    } = await request.json();

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        title,
        description: description || "",
        date,
        time,
        kidId,
        category,
        reminder: reminder || false,
        repeatType: repeatType || "NONE",
        repeatUntil: repeatUntil || null,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete an event
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID required" },
        { status: 400 }
      );
    }

    // Extract base event ID (before :: for recurring events)
    const baseEventId = eventId.includes("::") ? eventId.split("::")[0] : eventId;

    await prisma.event.delete({
      where: { id: baseEventId },
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
