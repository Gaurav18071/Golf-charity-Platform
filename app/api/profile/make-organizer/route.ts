/**
 * Make the currently logged-in user an ORGANIZER
 * 
 * For testing/development only - in production, this should require admin permissions
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Update profile to ORGANIZER
    const profile = await prisma.profile.update({
      where: { id: user.id },
      data: {
        role: UserRole.ORGANIZER,
      },
    });

    return NextResponse.json({
      success: true,
      message: "You are now an ORGANIZER! Please logout and login again.",
      profile: {
        id: profile.id,
        fullName: profile.fullName,
        role: profile.role,
      },
    });
  } catch (error) {
    console.error("Role update error:", error);
    
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return NextResponse.json(
        { error: "Profile not found. Please run /api/profile/sync first." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update role", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
