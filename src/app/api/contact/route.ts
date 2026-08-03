export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { getMailTransporter, escapeHtml } from "@/lib/mailer";

const ContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Invalid email"),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(1, "Message is required").max(5000),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }
  const { name, email, subject, message } = parsed.data;

  const text = [
    `New contact form message`,
    `From: ${name} <${email}>`,
    `Subject: ${subject}`,
    "",
    message,
  ].join("\n");

  const html = `
    <h2>New contact form message</h2>
    <p><b>From:</b> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
    <p><b>Subject:</b> ${escapeHtml(subject)}</p>
    <pre style="white-space:pre-wrap;font-family:ui-monospace,SFMono-Regular,Menlo,monospace">${escapeHtml(message)}</pre>
  `.trim();

  try {
    await getMailTransporter().sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
      replyTo: email,
      subject: `Nea Genia Contact: ${subject}`,
      text,
      html,
    });
  } catch (err) {
    console.error("[contact] send error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
