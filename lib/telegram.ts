import "server-only";

/**
 * Telegram Bot API client. Configure with TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID (see .env.example).
 * TELEGRAM_CHAT_ID takes one or more recipients separated by commas. A recipient is a user, group
 * or channel id, optionally followed by ":<topicId>" for a topic inside a forum group.
 * When nothing is configured, sending is skipped, so the site works the same without Telegram.
 */

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

type Recipient = { chatId: string; threadId?: number };

export function telegramRecipients(raw = process.env.TELEGRAM_CHAT_ID ?? ""): Recipient[] {
  const seen = new Set<string>();
  const out: Recipient[] = [];
  for (const entry of raw.split(/[,;\s]+/)) {
    if (!entry) continue;
    const [chatId, thread] = entry.split(":");
    const threadId = Number(thread);
    const key = `${chatId}:${thread ?? ""}`;
    if (!chatId || seen.has(key)) continue;
    seen.add(key);
    out.push({ chatId, ...(Number.isInteger(threadId) && threadId > 0 && { threadId }) });
  }
  return out;
}

export const telegramEnabled = () => Boolean(process.env.TELEGRAM_BOT_TOKEN) && telegramRecipients().length > 0;

export type SendResult = { ok: false; reason: "disabled" } | { ok: true; sent: number; total: number };

async function sendOne(token: string, to: Recipient, text: string, buttonUrl?: string, buttonText?: string): Promise<boolean> {
  const body: Record<string, unknown> = {
    chat_id: to.chatId,
    text,
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
    ...(to.threadId && { message_thread_id: to.threadId }),
  };
  // Telegram rejects inline buttons that point at http/localhost URLs.
  if (buttonUrl?.startsWith("https://")) {
    body.reply_markup = { inline_keyboard: [[{ text: buttonText ?? "Aç", url: buttonUrl }]] };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) {
      // Never log the URL: it contains the bot token. A person must press /start on the bot first.
      console.error("telegram send failed", to.chatId, response.status, await response.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (error) {
    console.error("telegram send error", to.chatId, error instanceof Error ? error.name : "unknown");
    return false;
  }
}

/** Sends to every recipient in parallel. One failing recipient never blocks the others. */
export async function sendTelegramHtml(
  html: string,
  options: { buttonUrl?: string; buttonText?: string } = {},
): Promise<SendResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const recipients = telegramRecipients();
  if (!token || recipients.length === 0) return { ok: false, reason: "disabled" };

  const text = html.slice(0, 4000);
  const results = await Promise.all(recipients.map((r) => sendOne(token, r, text, options.buttonUrl, options.buttonText)));
  return { ok: true, sent: results.filter(Boolean).length, total: recipients.length };
}

export type LeadNotification = {
  name: string;
  company: string;
  phone: string;
  email: string;
  message: string;
  locale: string;
  page: string;
  product?: { name: string; formula: string; slug: string } | null;
  createdAt: Date;
};

const line = (label: string, value: string) => (value ? `${label}: <b>${escapeHtml(value)}</b>` : "");

/** Structured "new order / inquiry" message. Empty fields are left out. */
export function formatLeadMessage(lead: LeadNotification): string {
  const when = new Intl.DateTimeFormat("az-AZ", {
    timeZone: "Asia/Baku",
    dateStyle: "short",
    timeStyle: "short",
  }).format(lead.createdAt);

  const product = lead.product
    ? `${lead.product.name}${lead.product.formula ? ` (${lead.product.formula})` : ""}`
    : "";

  const fields = [
    line("👤 Ad", lead.name),
    line("🏢 Şirkət", lead.company),
    line("📞 Telefon", lead.phone),
    line("✉️ E-poçt", lead.email),
    line("📦 Məhsul", product),
  ].filter(Boolean);

  return [
    "🆕 <b>Yeni sifariş / müraciət</b>",
    fields.join("\n"),
    `💬 <b>Mesaj</b>\n<blockquote>${escapeHtml(lead.message.slice(0, 1500))}</blockquote>`,
    `🌐 Dil: ${lead.locale.toUpperCase()}${lead.page ? ` · ${escapeHtml(lead.page)}` : ""}\n🕒 ${escapeHtml(when)}`,
  ].join("\n\n");
}
