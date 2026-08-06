/**
 * Sync current Supabase Auth user to Neon profiles table
 * 
 * This endpoint creates/updates a profile for the currently logged-in user
 * Call this once for existing users who don't have profiles in Neon yet
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    // Get current user from Supabase Auth
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Extract user data from Supabase
    const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
    const role = (user.user_metadata?.role as UserRole) || UserRole.DONOR;
    const email = user.email!;

    // Upsert profile in Neon (create if doesn't exist, update if exists)
    const profile = await prisma.profile.upsert({
      where: { id: user.id },
      update: {
        email,
        fullName,
        role,
      },
      create: {
        id: user.id,
        email,
        fullName,
        role,
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        role: profile.role,
      },
    });
  } catch (error) {
    console.error("Profile sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync profile", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
