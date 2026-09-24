// Prints the chat id for TELEGRAM_CHAT_ID: whoever has messaged your bot.
// Send your new bot any message in Telegram first, then run `npm run telegram`
// (it reads TELEGRAM_BOT_TOKEN from .env.local).

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("Add TELEGRAM_BOT_TOKEN=<token from @BotFather> to .env.local first.");
  process.exit(1);
}

const body = await (await fetch(`https://api.telegram.org/bot${token}/getUpdates`)).json();
if (!body.ok) {
  console.error(`Telegram: ${body.description}`);
  process.exit(1);
}

const chats = new Map();
for (const u of body.result) {
  const chat = (u.message ?? u.edited_message)?.chat;
  if (chat) chats.set(chat.id, chat.username ?? chat.first_name ?? chat.title ?? "");
}
if (!chats.size) console.log("Nothing yet. Send your bot any message in Telegram, then run this again.");
for (const [id, name] of chats) console.log(`TELEGRAM_CHAT_ID=${id}   (${name})`);
