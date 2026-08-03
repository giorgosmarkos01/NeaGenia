import { getMailTransporter, escapeHtml } from "@/lib/mailer";

export type OrderConfirmationLine = {
  name: string;
  qty: number;
  unitPrice: number;
  variationNames?: string | null;
};

export type OrderConfirmationInput = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  lines: OrderConfirmationLine[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingOption: string;
  address: { address: string; city: string; province: string; zip: string; country: string };
};

/** Best-effort send — failures are logged, never thrown, so they can't break order creation. */
export async function sendOrderConfirmationEmail(input: OrderConfirmationInput): Promise<void> {
  const { orderId, customerName, customerEmail, lines, subtotal, shippingCost, total, shippingOption, address } =
    input;

  const shortId = orderId.slice(0, 8);

  const rowsText = lines
    .map(
      (l) =>
        `${l.qty} x ${l.name}${l.variationNames ? ` (${l.variationNames})` : ""} - €${(
          l.unitPrice * l.qty
        ).toFixed(2)}`
    )
    .join("\n");

  const text = [
    `Thank you for your order, ${customerName}!`,
    ``,
    `Order #${shortId}`,
    ``,
    rowsText,
    ``,
    `Subtotal: €${subtotal.toFixed(2)}`,
    `Shipping (${shippingOption}): €${shippingCost.toFixed(2)}`,
    `Total: €${total.toFixed(2)}`,
    ``,
    `Delivery address:`,
    `${address.address}, ${address.zip} ${address.city}, ${address.province}, ${address.country}`,
    ``,
    `We'll let you know once your order ships. If you have any questions, just reply to this email.`,
    ``,
    `Nea Genia Technologies`,
  ].join("\n");

  const rowsHtml = lines
    .map(
      (l) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">
          ${escapeHtml(l.name)}${l.variationNames ? `<br/><span style="color:#888;font-size:12px;">${escapeHtml(l.variationNames)}</span>` : ""}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center;">${l.qty}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">€${(l.unitPrice * l.qty).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
      <h2 style="color:#062A56;">Thank you for your order, ${escapeHtml(customerName)}!</h2>
      <p style="color:#555;">Order <b>#${escapeHtml(shortId)}</b> has been received and is being processed.</p>

      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <thead>
          <tr>
            <th style="text-align:left;border-bottom:2px solid #062A56;padding-bottom:8px;">Item</th>
            <th style="text-align:center;border-bottom:2px solid #062A56;padding-bottom:8px;">Qty</th>
            <th style="text-align:right;border-bottom:2px solid #062A56;padding-bottom:8px;">Total</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>

      <div style="margin-top:16px;text-align:right;color:#333;">
        <div>Subtotal: €${subtotal.toFixed(2)}</div>
        <div>Shipping (${escapeHtml(shippingOption)}): €${shippingCost.toFixed(2)}</div>
        <div style="font-size:18px;font-weight:bold;color:#F75807;margin-top:4px;">Total: €${total.toFixed(2)}</div>
      </div>

      <div style="margin-top:24px;padding:16px;background:#f7f7f7;border-radius:8px;">
        <b>Delivery address</b>
        <p style="margin:4px 0 0;color:#555;">
          ${escapeHtml(address.address)}<br/>
          ${escapeHtml(address.zip)} ${escapeHtml(address.city)}, ${escapeHtml(address.province)}<br/>
          ${escapeHtml(address.country)}
        </p>
      </div>

      <p style="margin-top:24px;color:#888;font-size:13px;">
        We'll let you know once your order ships. If you have any questions, just reply to this email.
      </p>
      <p style="color:#062A56;font-weight:bold;">Nea Genia Technologies</p>
    </div>
  `.trim();

  try {
    await getMailTransporter().sendMail({
      from: process.env.MAIL_FROM,
      to: customerEmail,
      subject: `Your Nea Genia Technologies order #${shortId}`,
      text,
      html,
    });
  } catch (err) {
    console.error("[orderConfirmation] send error:", err);
  }
}
