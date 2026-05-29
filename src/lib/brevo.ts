const BREVO_API_URL = "https://api.brevo.com/v3/contacts";

export async function addBrevoContact(email: string): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("[BREVO] BREVO_API_KEY not set — skipping contact creation");
    return;
  }

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.toLowerCase().trim(),
      updateEnabled: true,
    }),
  });

  // 201 = created, 204 = already exists (with updateEnabled), both are fine
  if (!res.ok && res.status !== 204) {
    const text = await res.text().catch(() => "");
    throw new Error(`Brevo API error ${res.status}: ${text}`);
  }
}
