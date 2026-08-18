import { NextResponse } from "next/server";
import { processRazorpayWebhook } from "@/features/donation/services/donation.service";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";

    if (!signature) {
      return NextResponse.json(
        { error: "Missing x-razorpay-signature header" },
        { status: 400 }
      );
    }

    let eventPayload;
    try {
      eventPayload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON webhook payload" },
        { status: 400 }
      );
    }

    const result = await processRazorpayWebhook(rawBody, signature, eventPayload);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ received: true, message: result.message }, { status: 200 });
  } catch (error) {
    console.error("[POST /api/webhooks/razorpay] Error:", error);
    return NextResponse.json(
      { error: "Internal webhook processing error" },
      { status: 500 }
    );
  }
}
