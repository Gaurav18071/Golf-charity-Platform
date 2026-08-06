import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, fullName, role } = body;

    if (!id || !email || !fullName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create profile in Neon database
    const profile = await prisma.profile.create({
      data: {
        id,
        email,
        fullName,
        role: (role as UserRole) || UserRole.DONOR,
      },
    });

    return NextResponse.json({ success: true, profile }, { status: 201 });
  } catch (error) {
    console.error("Profile creation error:", error);
    
    // If profile already exists, that's okay
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json({ success: true, message: "Profile already exists" });
    }

    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    );
  }
}
