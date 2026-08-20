import { generateNotificationEmailHtml, EmailTemplateProps } from "../templates";

export interface SendEmailOptions {
  to: string;
  subject: string;
  recipientName?: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

/**
 * Provider-independent Email Service
 * Handles transactional emails safely without breaking caller database operations.
 */
export async function sendNotificationEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const html = generateNotificationEmailHtml({
      recipientName: options.recipientName || "Member",
      title: options.title,
      message: options.message,
      actionUrl: options.actionUrl,
      actionText: options.actionText,
    });

    // In local development / when provider key is unconfigured:
    const resendApiKey = process.env.RESEND_API_KEY;
    const smtpHost = process.env.SMTP_HOST;

    if (!resendApiKey && !smtpHost) {
      console.log(
        `[EmailService:Simulated] To: ${options.to} | Subject: "${options.subject}" | Title: "${options.title}"`
      );
      return { success: true };
    }

    // When provider is available (e.g. Resend REST API):
    if (resendApiKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "Golf Charity <notifications@golfcharity.com>",
          to: options.to,
          subject: options.subject,
          html,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn("[EmailService] Resend API response error:", errorText);
        return { success: false, error: errorText };
      }
    }

    return { success: true };
  } catch (error) {
    // Failure handling: never crash the core transaction
    console.error("[EmailService] Failed to send email safely:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}
