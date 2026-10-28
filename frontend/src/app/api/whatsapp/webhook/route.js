import { NextResponse } from "next/server";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "frangipani_meta_verify_secret_2026";

/**
 * GET /api/whatsapp/webhook
 * Meta Webhook Verification Handshake (PDF Section 6 & 8)
 * Meta calls this when you configure or verify the webhook in Meta App Dashboard.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[Meta WhatsApp Webhook] Verification successful.");
    // Return challenge verbatim
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  console.warn("[Meta WhatsApp Webhook] Verification token mismatch.", { token, expected: VERIFY_TOKEN });
  return NextResponse.json({ error: "Verification token mismatch" }, { status: 403 });
}

/**
 * POST /api/whatsapp/webhook
 * Receives Inbound Messages and Delivery Status Updates from Meta WhatsApp Cloud API.
 * Always returns HTTP 200 immediately to acknowledge receipt and prevent Meta retry queues.
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // Verify it is a WhatsApp webhook event
    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ status: "ignored" }, { status: 200 });
    }

    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const val = change.value;
        if (!val) continue;

        // Inbound Customer Messages
        if (val.messages && Array.isArray(val.messages)) {
          for (const msg of val.messages) {
            const from = msg.from; // Sender phone without '+' (e.g. 919820011223)
            const messageId = msg.id;
            const messageType = msg.type;
            const text = msg.text ? msg.text.body : `[Media message: ${messageType}]`;
            const timestamp = msg.timestamp
              ? new Date(Number(msg.timestamp) * 1000).toISOString()
              : new Date().toISOString();

            // Contact info if provided by Meta
            const contact = val.contacts?.find((c) => c.wa_id === from);
            const profileName = contact?.profile?.name || `Customer (+${from})`;

            console.log(`[Meta WhatsApp Inbound] From ${profileName} (${from}): ${text}`);
            // Note: In a live production deployment with a persistent database,
            // this record is inserted into the `wa_messages` and `wa_conversations` tables.
          }
        }

        // Delivery Status Updates (sent, delivered, read)
        if (val.statuses && Array.isArray(val.statuses)) {
          for (const status of val.statuses) {
            console.log(`[Meta WhatsApp Status] Message ${status.id} -> ${status.status}`);
          }
        }
      }
    }

    return NextResponse.json({ status: "received", success: true }, { status: 200 });
  } catch (err) {
    console.error("[Meta WhatsApp Webhook Error]", err);
    // Still return 200 to satisfy Meta webhook contract
    return NextResponse.json({ status: "error", message: err.message }, { status: 200 });
  }
}
