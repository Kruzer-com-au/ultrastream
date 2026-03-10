/**
 * Confirmation email sender.
 * Currently mocked -- will use Resend SDK when RESEND_API_KEY is configured.
 * Email is a bonus, not a gate: signup succeeds even if email fails.
 */
export async function sendConfirmationEmail(
  email: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "ULTRASTREAM <noreply@ultrastream.gg>";

  // If no API key, mock the response (dev mode)
  if (!apiKey) {
    console.log(
      `[MOCK EMAIL] Would send confirmation to: ${email} from: ${fromEmail}`
    );
    return { success: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: "You're In. The Revolution Starts Now.",
        html: getConfirmationHtml(),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[EMAIL ERROR] Resend returned ${res.status}: ${body}`);
      return { success: false, error: `Email service error: ${res.status}` };
    }

    return { success: true };
  } catch (err) {
    console.error("[EMAIL ERROR]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}

function getConfirmationHtml(): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#050505;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid rgba(255,215,0,0.2);border-radius:12px;">
          <tr>
            <td style="padding:40px 30px;text-align:center;">
              <h1 style="color:#FFD700;font-size:28px;margin:0 0 8px;letter-spacing:2px;">ULTRASTREAM</h1>
              <p style="color:#6b7280;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0;">THE REVOLUTION IS COMING</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 30px 30px;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,#FFD700,transparent);opacity:0.3;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 30px 20px;">
              <h2 style="color:#f0f0f0;font-size:22px;margin:0 0 16px;">Welcome to the rebellion, warrior.</h2>
              <p style="color:#a0a0b0;font-size:15px;line-height:1.7;margin:0 0 16px;">
                You've claimed your spot on the ULTRASTREAM waitlist. When we launch, you'll be among the first to experience a streaming platform built for creators and viewers -- not corporations.
              </p>
              <p style="color:#a0a0b0;font-size:15px;line-height:1.7;margin:0 0 16px;">
                The villains' days are numbered.
              </p>
              <p style="color:#FFD700;font-size:14px;font-weight:bold;margin:0;">
                Keep 95-100% of your earnings. Get paid to watch. No censorship. No corporate overlords.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 30px;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,#7b2ff7,transparent);opacity:0.3;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 30px 40px;text-align:center;">
              <p style="color:#6b7280;font-size:13px;margin:0 0 12px;">Spread the word. Every new warrior strengthens the revolution.</p>
              <p style="color:#6b7280;font-size:11px;margin:0;">ULTRASTREAM -- For the People. By the Rebels. Against Corporate Streaming.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
