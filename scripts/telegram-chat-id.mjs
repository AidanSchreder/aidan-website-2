// Prints the chat id for TELEGRAM_CHAT_ID: whoever has messaged your bot.
// Send your new bot any message in Telegram first, then run `npm run telegram`
// (it reads TELEGRAM_BOT_TOKEN from .env.local). The token is never printed.

const raw = process.env.TELEGRAM_BOT_TOKEN ?? "";
// Same clean-up as app/_lib/messages.ts: spaces, quotes, <brackets>, a leading "bot".
const token = raw.trim().replace(/^["'<]|["'>]$/g, "").replace(/^bot(?=\d)/i, "");
if (!token) {
  console.error("Add your @BotFather token to .env.local first, as a line like: TELEGRAM_BOT_TOKEN=123456789:AAH4x…");
  process.exit(1);
}
if (token !== raw) console.log("Note: removed spaces, quotes, <brackets> or a leading \"bot\" from the token. Fix the value in Vercel too.");
if (!/^\d{6,}:[\w-]{30,}$/.test(token)) {
  const [id = "", secret = ""] = token.split(":");
  console.error(
    `That doesn't look like a @BotFather token (${token.length} characters; ` +
      `${/^\d+$/.test(id) ? `${id.length} digits` : "doesn't start with digits"}, ` +
      `${token.includes(":") ? `then ${secret.length} characters after the colon` : "no colon"}).\n` +
      "It should be digits, a colon, then about 35 letters and digits, e.g. 123456789:AAH4x… — copy it again from @BotFather (/mybots → your bot → API Token).",
  );
  process.exit(1);
}

const body = await (await fetch(`https://api.telegram.org/bot${token}/getUpdates`)).json();
if (!body.ok) {
  console.error(`Telegram: ${body.description}${body.error_code === 401 ? " — the token is the right shape but not a live bot token; copy it again from @BotFather." : ""}`);
  process.exit(1);
}

const chats = new Map();
for (const u of body.result) {
  const chat = (u.message ?? u.edited_message)?.chat;
  if (chat) chats.set(chat.id, chat.username ?? chat.first_name ?? chat.title ?? "");
}
if (!chats.size) console.log("Token works. Nothing yet: send your bot any message in Telegram, then run this again.");
for (const [id, name] of chats) console.log(`TELEGRAM_CHAT_ID=${id}   (${name})`);
