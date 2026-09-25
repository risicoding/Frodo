import { Bot } from "grammy";
import { constants } from "../constants";
import { formatBytes } from "../lib/format";
import { Teleproto } from "../teleproto";
import type { TelegramClient } from "teleproto";
import { AppError } from "../lib/error";
import { getSystemStatsPretty } from "../lib/system";
import { MessageStrings } from "./messages";
const { BOT_TOKEN } = constants;

const bot = new Bot(BOT_TOKEN);

export class BotApiError extends AppError {
  readonly tag = "BotApiError";
}
export const getBot = () => bot;
export const botHandler = (client: TelegramClient) => {
  const bot = getBot();

  bot.command("start", async (ctx) => {
    await ctx.reply(MessageStrings.start, {
      parse_mode: "HTML",
    });
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(
      "Available commands:\n" +
        "/start - Start the bot\n" +
        "/help - Show this help",
    );
  });

  bot.command("info", async (ctx) => {
    const res = await getSystemStatsPretty();
    if (res.isErr()) return await ctx.reply("cant get system stats");
    await ctx.reply(res.value, {
      parse_mode: "HTML",
    });
  });

  bot.on("message:text", async (ctx) => {
    await ctx.reply(`You said: ${ctx.message.text}`);
  });

  bot.on("message:document", async (ctx) => {
    const d = ctx.message.document;

    const fileName = d.file_name;
    const fileSize = d.file_size;

    if (!fileName || !fileSize) {
      return ctx.reply("File attributes not found");
    }

    console.log(`Downloading: ${fileName} : ${formatBytes(fileSize)}`);

    await Teleproto.downloadFile(client, ctx.msgId, fileName);
  });

  bot.catch((err) => {
    console.error("Bot error:", err);
  });

  console.log("Bot started");

  bot.start();
};
