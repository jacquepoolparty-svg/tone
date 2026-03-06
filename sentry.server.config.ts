import * as Sentry from "@sentry/nextjs";

const SITE_NAME = "TONE (tone-iota.vercel.app)";
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_ALERT_CHAT_ID || "8680349678";

async function notifyTelegram(event: Sentry.ErrorEvent): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) return;

  const error = event.exception?.values?.[0];
  const errorType = error?.type || "Error";
  const errorMsg = (error?.value || "Unknown error").slice(0, 300);
  const url = event.request?.url || "N/A";
  const env = event.environment || process.env.NODE_ENV || "production";

  const text = [
    `🚨 *${SITE_NAME}* — Unhandled Error`,
    ``,
    `*${errorType}*`,
    `${errorMsg}`,
    ``,
    `🌐 URL: ${url}`,
    `🏷️ Env: ${env}`,
  ].join("\n");

  try {
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: "Markdown",
        }),
      }
    );
  } catch {
    // Never let Telegram notify block error reporting
  }
}

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  beforeSend(event) {
    notifyTelegram(event);
    return event;
  },
});
