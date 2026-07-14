import { NextResponse } from "next/server";
import crypto from "crypto";
import { pool } from "@/lib/db";

const getWebhookSecret = () => {
  return (
    process.env.PAGBANK_WEBHOOK_SECRET ||
    process.env.PAGBANK_WEBHOOK_TOKEN ||
    ""
  );
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

const normalizeReferenceValue = (value) => {
  if (value === null || value === undefined) return null;

  const asString = String(value).trim();
  if (!asString) return null;

  const normalized = asString.replace(/^checkout-/i, "");
  const asNumber = Number(normalized);

  if (!Number.isNaN(asNumber)) {
    return String(asNumber);
  }

  return normalized;
};

const extractReferenceFromText = (rawBody) => {
  if (!rawBody) return null;

  const patterns = [
    /"reference_id"\s*:\s*"([^"]+)"/i,
    /"order_id"\s*:\s*"([^"]+)"/i,
    /"referenceId"\s*:\s*"([^"]+)"/i,
  ];

  for (const pattern of patterns) {
    const match = rawBody.match(pattern);
    if (match?.[1]) {
      return normalizeReferenceValue(match[1]);
    }
  }

  return null;
};

const extractOrderId = (payload, rawBody = "") => {
  const candidates = [
    payload?.reference_id,
    payload?.data?.reference_id,
    payload?.data?.attributes?.reference_id,
    payload?.resource?.reference_id,
    payload?.resource?.order_id,
    payload?.notification?.reference_id,
    payload?.notification?.resource?.reference_id,
    payload?.charge?.reference_id,
    payload?.payment?.reference_id,
    payload?.payment?.order_id,
    payload?.resource?.data?.reference_id,
    payload?.data?.id,
  ];

  for (const value of candidates) {
    const normalized = normalizeReferenceValue(value);
    if (normalized) {
      return normalized;
    }
  }

  return extractReferenceFromText(rawBody);
};

const hasApprovedKeyword = (value) => {
  if (!value) return false;

  const normalized = String(value).toLowerCase();
  return /(approved|paid|confirmed|settled|captured|completed|authorized|success|succeeded)/.test(
    normalized,
  );
};

const hasDeclinedKeyword = (value) => {
  if (!value) return false;

  const normalized = String(value).toLowerCase();
  return /(declined|failed|canceled|cancelled|expired|refused|denied|error)/.test(
    normalized,
  );
};

const isLikelyOrderResource = (payload) => {
  if (!payload || typeof payload !== "object") return false;

  return (
    Boolean(
      payload.reference_id ||
      payload.order_id ||
      payload.id ||
      payload.resource?.reference_id ||
      payload.resource?.id,
    ) &&
    Boolean(
      payload.items ||
      payload.customer ||
      payload.created_at ||
      payload.charges ||
      payload.payment_methods ||
      payload.payments ||
      payload.payment_response,
    )
  );
};

const isPaymentApproved = (payload) => {
  const stack = [payload];

  while (stack.length > 0) {
    const current = stack.pop();

    if (!current || typeof current !== "object") {
      continue;
    }

    for (const [key, value] of Object.entries(current)) {
      if (
        key === "status" ||
        key === "state" ||
        key === "event" ||
        key === "type"
      ) {
        if (hasApprovedKeyword(value)) return true;
        if (hasDeclinedKeyword(value)) return false;
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          stack.push(item);
        }
      } else if (value && typeof value === "object") {
        stack.push(value);
      }
    }
  }

  if (isLikelyOrderResource(payload)) {
    return true;
  }

  return false;
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

    let payload = {};

    try {
      payload = JSON.parse(rawBody || "{}");
    } catch {
      payload = {};
    }

    const orderId = extractOrderId(payload, rawBody);
    const paymentApproved = isPaymentApproved(payload);

    console.log("📥 Webhook PagBank recebido", {
      orderId,
      paymentApproved,
      signaturePresent: Boolean(signature),
      bodyPreview: rawBody.slice(0, 500),
    });

    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json(
        { error: "Assinatura inválida" },
        { status: 401 },
      );
    }

    if (!orderId) {
      return NextResponse.json({
        received: true,
        ignored: true,
        reason: "order_id_not_found",
      });
    }

    if (!paymentApproved) {
      return NextResponse.json({
        received: true,
        ignored: true,
        reason: "event_not_approved",
      });
    }

    client = await pool.connect();
    await client.query("BEGIN");

    const orderCheck = await client.query(
      "SELECT id FROM orders WHERE id = $1",
      [orderId],
    );

    if (orderCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 },
      );
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
    return NextResponse.json(
      { error: error.message || "Erro ao processar webhook" },
      { status: 500 },
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "Webhook do PagBank ativo" });
}
