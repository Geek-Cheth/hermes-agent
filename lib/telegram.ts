export async function sendTelegramFallback(summary: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: summary.slice(0, 4096),
      parse_mode: 'HTML',
    }),
  });
}

export function extractTelegramSummary(text: string): string | null {
  const marker = 'TELEGRAM_SUMMARY:';
  const idx = text.indexOf(marker);
  if (idx === -1) return null;
  return text.slice(idx + marker.length).trim();
}
