import { NextResponse } from "next/server";
import crypto from "crypto";
import { pool } from "@/lib/db";

const getWebhookSecret = () => {
  return process.env.PAGBANK_WEBHOOK_SECRET || process.env.PAGBANK_WEBHOOK_TOKEN || "";
};

const verifySignature = (rawBody, signature) => {
  const secret = getWebhookSecret();

  if (!secret) {
    return true;
  }

  if (!signature) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return expected === signature.toLowerCase();
};

const extractOrderId = (payload) => {
  const candidates = [
    payload?.reference_id,
    payload?.data?.reference_id,
    payload?.resource?.reference_id,
    payload?.notification?.reference_id,
    payload?.charge?.reference_id,
    payload?.payment?.reference_id,
    payload?.data?.id,
  ];

  for (const value of candidates) {
    if (!value) continue;

    const normalized = String(value).replace(/^checkout-/, "");
    const asNumber = Number(normalized);

    if (!Number.isNaN(asNumber)) {
      return String(asNumber);
    }

    if (normalized) {
      return normalized;
    }
  }

  return null;
};

const isPaymentApproved = (payload) => {
  const event = String(payload?.event || payload?.type || payload?.notification?.event || "")
    .toLowerCase();

  const status = String(payload?.status || payload?.payment?.status || payload?.data?.status || payload?.notification?.status || "")
    .toLowerCase();

  return (
    event.includes("approved") ||
    event.includes("paid") ||
    event.includes("confirmed") ||
    event.includes("settled") ||
    status.includes("paid") ||
    status.includes("approved") ||
    status.includes("confirmed")
  );
};

export async function POST(request) {
  let client;

  try {
    const rawBody = await request.text();
    const signature =
      request.headers.get("x-pagseguro-hmac-sha256") ||
      request.headers.get("x-hub-signature-256") ||
      request.headers.get("x-signature") ||
      "";

    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody || "{}" );
    const orderId = extractOrderId(payload);

    if (!orderId) {
      return NextResponse.json({ received: true, ignored: true, reason: "order_id_not_found" });
    }

    if (!isPaymentApproved(payload)) {
      return NextResponse.json({ received: true, ignored: true, reason: "event_not_approved" });
    }

    client = await pool.connect();
    await client.query("BEGIN");

    const orderCheck = await client.query("SELECT id FROM orders WHERE id = $1", [orderId]);

    if (orderCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    await client.query(
      `UPDATE orders SET status = 'preparing', updated_at = NOW() WHERE id = $1`,
      [orderId],
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Pagamento confirmado e pedido atualizado",
      orderId,
    });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }

    console.error("Erro no webhook do PagBank:", error);
    return NextResponse.json({ error: error.message || "Erro ao processar webhook" }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "Webhook do PagBank ativo" });
}
