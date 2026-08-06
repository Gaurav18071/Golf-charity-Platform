import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const body = await request.json() as { fullName?: string; avatarUrl?: string };

    const updated = await prisma.profile.update({
      where: { id: user.id },
      data: {
        ...(body.fullName !== undefined && { fullName: body.fullName }),
        ...(body.avatarUrl !== undefined && { avatarUrl: body.avatarUrl }),
      },
    });

    return NextResponse.json({ profile: updated });
  } catch (err) {
    console.error("PATCH /api/profile error:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
