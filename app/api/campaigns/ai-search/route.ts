import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { aiCampaignSearchAction } from "@/app/actions/campaign-search.actions";
import { z } from "zod";

const RequestSchema = z.object({
  query: z
    .string()
    .min(2, "Query must be at least 2 characters")
    .max(500, "Query is too long"),
});

/**
 * POST /api/campaigns/ai-search
 *
 * Public endpoint — supports both authenticated and anonymous donors.
 * Rate limiting is enforced inside the server action:
 *   - Authenticated users: 10 requests / 60 seconds
 *   - Anonymous users:     5 requests / 60 seconds (keyed by IP)
 *
 * SECURITY:
 * - User identity is resolved server-side from Supabase session.
 * - No userId accepted from the request body.
 * - AI never queries the database.
 * - Only ACTIVE, publicly-discoverable campaigns are returned.
 * - No adminNotes, payment credentials, or internal org data exposed.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body", results: [], mode: "fallback" },
        { status: 400 }
      );
    }

    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid request",
          results: [],
          mode: "fallback",
        },
        { status: 400 }
      );
    }

    // Authenticate user (optional — public search allowed)
    // Server action resolves its own identity; this just avoids double auth
    const supabase = await createClient();
    await supabase.auth.getUser(); // Ensures session cookie is valid if present

    const result = await aiCampaignSearchAction(parsed.data.query);

    const status = result.success ? 200 : 422;
    return NextResponse.json(result, { status });
  } catch (error) {
    console.error("[POST /api/campaigns/ai-search] Unhandled error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Search service temporarily unavailable",
        results: [],
        mode: "fallback",
      },
      { status: 500 }
    );
  }
}
