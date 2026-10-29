import { zoomRegistrationEmail } from "./email-template.mjs";

export default async function sendTestEmail(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed." });
  }

  let body;
  try {
    body = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
  } catch {
    return response.status(400).json({ error: "Invalid request." });
  }

  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return response.status(400).json({ error: "Enter a valid email address." });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.BREVO_FROM_EMAIL;
  if (!apiKey || !from) {
    return response.status(503).json({ error: "Test email is not configured." });
  }

  try {
    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sender: { name: "Tenant Resource Assistant", email: from },
        to: [{ email }],
        ...zoomRegistrationEmail()
      })
    });

    if (!brevoResponse.ok) {
      return response.status(502).json({ error: "Test email could not be sent." });
    }

    return response.status(200).json({ sent: true });
  } catch {
    return response.status(502).json({ error: "Test email could not be sent." });
  }
};
