export interface EmailTemplateProps {
  recipientName: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

export function generateNotificationEmailHtml({
  recipientName,
  title,
  message,
  actionUrl,
  actionText = "View in Dashboard",
}: EmailTemplateProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #0B3B24; padding: 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; }
    .header p { color: #86efac; margin: 4px 0 0 0; font-size: 12px; }
    .content { padding: 32px 24px; }
    .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
    .message { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .btn-container { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; background-color: #047857; color: #ffffff !important; padding: 12px 28px; border-radius: 12px; font-size: 14px; font-weight: bold; text-decoration: none; }
    .footer { border-top: 1px solid #f1f5f9; padding: 20px 24px; text-align: center; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⛳ Golf Charity</h1>
      <p>Play Better. Give Better.</p>
    </div>
    <div class="content">
      <div class="greeting">Hello ${recipientName || "there"},</div>
      <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">${title}</h2>
      <div class="message">${message}</div>
      ${
        actionUrl
          ? `<div class="btn-container"><a href="${actionUrl}" class="btn">${actionText}</a></div>`
          : ""
      }
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Golf Charity Platform. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
}
